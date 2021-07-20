import { Alert, Button } from "design-react-kit";
import React, { ChangeEvent, Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Link } from "react-router-dom";

import get from "lodash/get";
import { getStorage } from "../context/storage";

import { getFromBackend, postToBackend, putToBackend } from "../utils/backend";

import FaEye from "react-icons/lib/fa/eye";
import FaEyeSlash from "react-icons/lib/fa/eye-slash";

import { RouteComponentProps } from "react-router";
import Confirmation from "../components/modal/Confirmation";
import NewService from "../components/modal/NewService";

import { MsalConfig } from "../../generated/definitions/backend/MsalConfig";

import { Service } from "io-functions-commons/dist/generated/definitions/Service";

import { SubscriptionCollection } from "../../generated/definitions/backend/SubscriptionCollection";
import { SubscriptionContract } from "../../generated/definitions/backend/SubscriptionContract";
import { UserData } from "../../generated/definitions/backend/UserData";

import {
  getServiceReviewStatus,
  handleReviewStatus,
  ReviewStatus,
  ServiceStatus,
  ValidService
} from "../utils/service";

const getMail = (email: string) =>
  email && email !== "" ? atob(email) : undefined;

const SubscriptionService = ({
  service,
  t,
  status,
  atLeastOneVisible
}: {
  service: Service;
  t: (key: string) => string;
  status: string;
  atLeastOneVisible: boolean;
}) => {
  return service ? (
    <div>
      <h5>
        <span className="light-text">{t("service:title")}:</span>{" "}
        <span className="dark-text">{service.service_id}</span>
      </h5>
      <div className="my-3">
        <span className="light-text">{t("service:name")}:</span>{" "}
        <span className="light-text">{service.service_name}</span>
      </div>
      <div className="my-3">
        <span className="light-text">{t("service:organization")}:</span>{" "}
        <span className="light-text">{service.organization_name}</span>
      </div>
      <div className="my-3">
        <span className="light-text">
          {t("service:authorized_recipients")}:
        </span>{" "}
        <span className="light-text">{service.authorized_recipients}</span>
      </div>
      <div className="my-3">
        <span className="light-text">{t("service:authorized_ips")}:</span>{" "}
        <span className="light-text">{service.authorized_cidrs}</span>
      </div>
      <div className="my-3">
        <span className="light-text">
          {t("service:max_allowed_payment_amount")}:
        </span>{" "}
        <span className="light-text">
          {service.max_allowed_payment_amount} {t("service:eurocents")}
        </span>
      </div>
      <div className="status-row">
        <div className="col-md-8">
          {status === ServiceStatus.DRAFT ||
          status === ServiceStatus.NOT_FOUND ? (
            <div className="service-status">
              <div>
                <span className="circle" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_draft")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.REJECTED ? (
            <div className="service-status">
              <div>
                <span className="circle circle-red" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_not_valid")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.REVIEW ? (
            <div className="service-status">
              <div>
                <span className="circle circle-yellow" />
                <div>
                  <span className="light-text">
                    {t("service:state")}:&nbsp;
                  </span>
                  <span className="dark-text">
                    {t("profile:service_review")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.VALID ? (
            <div className="service-status">
              <div>
                <span className="circle circle-green" />
                <div>
                  <span className="ligh-text">{t("service:state")}</span>:
                  &nbsp;
                  <span className="dark-text">
                    {t("profile:service_valid")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.DEACTIVE ? (
            <div className="service-status">
              <div>
                <span className="circle circle-green" />
                <div>
                  <span className="ligh-text">{t("service:state")}</span>:
                  &nbsp;
                  <span className="dark-text">
                    {t("profile:service_valid")} (
                    {t("service:deactive_service_title")})
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {status === ServiceStatus.LOADING ? (
            <div className="service-status">
              <div>
                <span className="circle circle-black" />
                <div>
                  <span className="ligh-text">{t("service:state")}</span>:
                  &nbsp;
                  <span className="dark-text">
                    {t("profile:service_loading")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="col-md-4">
          <Link
            className="btn btn-primary"
            to={{
              pathname: `/service/${service.service_id}`,
              state: {
                isVisible: atLeastOneVisible
              }
            }}
          >
            {t("service:edit")}
          </Link>
        </div>
      </div>
    </div>
  ) : null;
};

type Props = RouteComponentProps<{ email: string }> & WithNamespaces;

function isString<T>(value: T | string): value is string {
  return typeof value === "string";
}

interface UserSubscriptions {
  [key: string]: SubscriptionContract;
}

type ProfileState = {
  applicationConfig: MsalConfig;
  userData: UserData | {};
  newSubscription: {
    service_name?: string;
    department_name?: string;
    organization_name?: string;
    organization_fiscal_code?: string;
    new_user?: {
      adb2c_id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  userSubscriptions: UserSubscriptions;
  keyDisplay: {
    [x: string]: undefined | boolean;
  };
  services: { [serviceId: string]: Service };
  isConfirmationOpen: boolean;
  onConfirmOperation: () => void;
  serviceState: { [serviceId: string]: string };
  showModal: boolean;
  atLeastOneVisible: boolean;
};

class Profile extends Component<Props, ProfileState> {
  public state: ProfileState = {
    userData: {},
    userSubscriptions: {},
    services: {},
    serviceState: {},
    applicationConfig: {
      audience: "",
      authority: "",
      b2cScopes: [],
      changePasswordLink: "",
      clientID: ""
    },
    newSubscription: {},
    keyDisplay: {},
    isConfirmationOpen: false,
    onConfirmOperation: () => undefined,
    showModal: false,
    atLeastOneVisible: false
  };

  public onAddSubscription = async () => {
    const email = getMail(this.props.match.params.email);

    const userSubscription: SubscriptionContract = await postToBackend<
      SubscriptionContract
    >({
      path: "subscriptions" + (email ? "/" + encodeURIComponent(email) : ""),
      options: {
        body: JSON.stringify(
          Object.assign(
            {},
            {
              organization_fiscal_code: this.state.newSubscription
                .organization_fiscal_code,
              organization_name: this.state.newSubscription.organization_name,
              department_name: this.state.newSubscription.department_name,
              service_name: this.state.newSubscription.service_name
            },
            this.state.newSubscription.new_user
              ? { new_user: this.state.newSubscription.new_user }
              : {}
          )
        )
      }
    });

    if (isString(userSubscription.name)) {
      const key = userSubscription.name;
      this.setState(prevState => ({
        userSubscriptions: {
          ...prevState.userSubscriptions,
          [key]: userSubscription
        }
      }));
    }

    const service: Service = await getFromBackend<Service>({
      path: `services/${userSubscription.name}`
    });

    this.setState(prevState => ({
      services: { ...prevState.services, [service.service_id]: service }
    }));
  };

  public async componentDidMount() {
    const email = getMail(this.props.match.params.email);

    const applicationConfig: MsalConfig = await getFromBackend<MsalConfig>({
      path: "configuration"
    });
    this.setState({ applicationConfig });

    const userData: UserData = await getFromBackend<UserData>({
      path: "user" + (email ? "/" + encodeURIComponent(email) : "")
    });

    this.setState({
      userData
    });

    const isEditingAuthenticatedUser = !email;

    if (isEditingAuthenticatedUser) {
      // prepopulate new subscription form with values from authenticated user
      // TODO: do this for admins (email = true) as well
      const storedUserData = getStorage().userData;
      this.setState({
        newSubscription: {
          service_name: storedUserData.extension_Service,
          department_name: storedUserData.extension_Department,
          organization_name: storedUserData.extension_Organization,
          organization_fiscal_code: "00000000000",
          new_user: {
            adb2c_id: storedUserData.oid,
            first_name: storedUserData.given_name,
            last_name: storedUserData.family_name,
            email: storedUserData.emails[0]
          }
        }
      });
    }

    // load all user's subscriptions
    const userSubscriptions: SubscriptionCollection = await getFromBackend<
      SubscriptionCollection
    >({
      path: "subscriptions" + (email ? "/" + encodeURIComponent(email) : "")
    });

    const userSubscriptionsObj = Object.keys(userSubscriptions).reduce<
      UserSubscriptions
    >((p, key) => {
      const numberKey = Number(key);
      if (isNaN(numberKey)) {
        return p;
      }
      const name = userSubscriptions[numberKey].name;
      return isString(name)
        ? {
            ...p,
            [name]: userSubscriptions[numberKey]
          }
        : p;
    }, {});

    this.setState({
      userSubscriptions: userSubscriptionsObj
    });

    // load all services related to the user's subscriptions
    Object.keys(userSubscriptionsObj).forEach(async subscriptionKey => {
      const subscription = userSubscriptionsObj[subscriptionKey];
      const service: Service = await getFromBackend<Service>({
        path: `services/${subscription.name}`
      });
      if (service.is_visible) {
        this.setState({ atLeastOneVisible: true });
      }
      this.checkService(service);
      this.setState(prevState => ({
        services: { ...prevState.services, [service.service_id]: service }
      }));
    });
  }

  public onToggleKey(keyIdx: string) {
    this.setState(prevState => ({
      keyDisplay: {
        ...prevState.keyDisplay,
        [keyIdx]: !prevState.keyDisplay[keyIdx]
      }
    }));
  }

  public onSetKey = (serviceKey: string, service: Service) => () => {
    sessionStorage.setItem("serviceKey", serviceKey);
    sessionStorage.setItem("service", JSON.stringify(service));
    window.location.replace("/compose");
  };

  public onRegenerateKey = (
    keyType: string,
    subscriptionId: string
  ) => async () => {
    this.setState({
      isConfirmationOpen: true,
      onConfirmOperation: async () => {
        const userSubscription: SubscriptionContract = await putToBackend<
          SubscriptionContract
        >({
          path: "subscriptions/" + subscriptionId + "/" + keyType + "_key",
          options: { body: undefined }
        });
        this.setState(prevState => ({
          isConfirmationOpen: false,
          userSubscriptions: isString(userSubscription.name)
            ? {
                ...prevState.userSubscriptions,
                [userSubscription.name]: userSubscription
              }
            : prevState.userSubscriptions
        }));
      }
    });
  };

  public handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState(prevState => ({
      newSubscription: {
        ...prevState.newSubscription,
        [name]: value
      }
    }));
  };

  public renderNewUserDiv() {
    const { t } = this.props;

    const isSameUser = !this.props.match.params.email;

    const firstName = get(this.state, "userData.apimUser.firstName");
    const lastName = get(this.state, "userData.apimUser.lastName");

    const userGroups = get(this.state, "userData.apimUser.groupNames");
    return (
      <div>
        <h4>{get(this.state, "userData.apimUser.email", t("new_user"))}</h4>
        <div className="row">
          <div className="col-md-8">
            {firstName && (
              <div>
                {t("name")}: {firstName}
              </div>
            )}
            {lastName && (
              <div>
                {t("surname")}: {lastName}
              </div>
            )}
            {isSameUser && this.state.applicationConfig.changePasswordLink && (
              <div>
                <a href={this.state.applicationConfig.changePasswordLink}>
                  {t("change_password")}
                </a>
              </div>
            )}
          </div>
          <div className="col-md-4">
            <button
              onClick={() => {
                this.setState({ showModal: true });
              }}
              className="btn btn-primary"
            >
              {t("create_new_service")}
            </button>
          </div>
        </div>

        <p
          style={{ maxWidth: "30em", wordWrap: "break-word" }}
          className="mt-4"
        >
          Autorizzazioni: {userGroups && userGroups.join(",")}
        </p>
        <p>
          Limitato:{" "}
          {userGroups && userGroups.indexOf("apimessagewrite") !== -1
            ? "no"
            : "si"}
        </p>
      </div>
    );
  }

  private renderServiceStatus(service: Service) {
    if (service) {
      return this.state.serviceState[service.service_id];
    } else {
      return this.props.t("service_loading");
    }
  }

  private checkService(service: Service) {
    const serviceId = service.service_id;
    const errorOrValidService = ValidService.decode(service);
    this.setState({
      serviceState: {
        ...this.state.serviceState,
        [serviceId]: ServiceStatus.LOADING
      }
    });
    if (!service.is_visible) {
      getServiceReviewStatus(service)
        .then(res => {
          this.setState({
            serviceState: {
              ...this.state.serviceState,
              [serviceId]: res.status
            }
          });
        })
        .catch(_ =>
          this.setState({
            serviceState: {
              ...this.state.serviceState,
              [serviceId]: ServiceStatus.NOT_FOUND
            }
          })
        );
    } else if (errorOrValidService.isRight()) {
      this.setState({
        serviceState: {
          ...this.state.serviceState,
          [serviceId]: ServiceStatus.VALID
        }
      });
    } else {
      this.setState({
        serviceState: {
          ...this.state.serviceState,
          [serviceId]: ServiceStatus.REJECTED
        }
      });
    }
  }

  public renderModal() {
    return (
      <NewService
        serviceName={get(this.state, "newSubscription.service_name")}
        departmentName={get(this.state, "newSubscription.department_name")}
        organizationName={get(this.state, "newSubscription.organization_name")}
        organization_fiscal_code={get(
          this.state,
          "newSubscription.organization_fiscal_code"
        )}
        onChange={this.handleInputChange}
        onAdd={this.onAddSubscription}
        onClose={() => this.setState({ showModal: false })}
        show={this.state.showModal}
      />
    );
  }

  public render() {
    const { userSubscriptions, services } = this.state;
    const { isConfirmationOpen, onConfirmOperation } = this.state;
    const { t } = this.props;

    return (
      <div className="m-4 p-5">
        {this.state.showModal && this.renderModal()}
        {this.renderNewUserDiv()}

        <div>
          <h4 className="mt-4">{t("services")}</h4>
          {Object.keys(userSubscriptions).reduce<ReadonlyArray<JSX.Element>>(
            (jsxElementsArray, key) => {
              const subscription = userSubscriptions[key];
              if (!isString(subscription.name)) {
                return jsxElementsArray;
              }
              const service = services[subscription.name];
              return [
                ...jsxElementsArray,
                <div className="card-service my-4" key={subscription.id}>
                  <div className="p-4 mt-4">
                    <SubscriptionService
                      service={service}
                      t={t}
                      status={this.renderServiceStatus(service)}
                      atLeastOneVisible={this.state.atLeastOneVisible}
                    />
                  </div>
                  <div className="card-service-key p-4">
                    <div>
                      {t("primary_key")}:{" "}
                      {this.state.keyDisplay[`p_${subscription.name}`]
                        ? subscription.primaryKey
                        : t("key")}
                      <Button
                        outline={true}
                        color="primary"
                        size="xs"
                        className="ml-1 mr-1"
                        onClick={() =>
                          this.onToggleKey(`p_${subscription.name}`)
                        }
                      >
                        {this.state.keyDisplay[`p_${subscription.name}`] ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </Button>
                      <Button
                        color="light"
                        size="xs"
                        className="mr-1"
                        disabled={!service || subscription.state !== "active"}
                        onClick={this.onRegenerateKey(
                          "primary",
                          subscription.name
                        )}
                      >
                        {t("regenerate")}
                      </Button>
                      <Button
                        color="primary"
                        size="xs"
                        className="mr-1"
                        disabled={!service || subscription.state !== "active"}
                        onClick={this.onSetKey(
                          subscription.primaryKey,
                          service
                        )}
                      >
                        {t("use")}
                      </Button>
                    </div>
                    <div className="my-2">
                      {t("secondary_key")}:{" "}
                      {this.state.keyDisplay[`s_${subscription.name}`]
                        ? subscription.secondaryKey
                        : t("key")}
                      <Button
                        outline={true}
                        color="primary"
                        size="xs"
                        className="ml-1 mr-1"
                        onClick={() =>
                          this.onToggleKey(`s_${subscription.name}`)
                        }
                      >
                        {this.state.keyDisplay[`s_${subscription.name}`] ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </Button>
                      <Button
                        color="light"
                        size="xs"
                        className="mr-1"
                        disabled={!service || subscription.state !== "active"}
                        onClick={this.onRegenerateKey(
                          "secondary",
                          subscription.name
                        )}
                      >
                        {t("regenerate")}
                      </Button>
                      <Button
                        color="primary"
                        size="xs"
                        className="mr-1"
                        disabled={!service || subscription.state !== "active"}
                        onClick={this.onSetKey(
                          subscription.secondaryKey,
                          service
                        )}
                      >
                        {t("use")}
                      </Button>
                    </div>
                  </div>
                </div>
              ];
            },
            []
          )}
        </div>

        <Confirmation
          isOpen={isConfirmationOpen}
          onCancel={() => this.setState({ isConfirmationOpen: false })}
          onConfirm={onConfirmOperation}
        />
      </div>
    );
  }
}

export default withNamespaces(["profile", "service"])(Profile);
