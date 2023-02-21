import { Badge } from "design-react-kit";
import React, { ChangeEvent, Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import get from "lodash/get";
import { getStorage } from "../context/storage";

import { getFromBackend, postToBackend, putToBackend } from "../utils/backend";

import { RouteComponentProps } from "react-router";
import Confirmation from "../components/modal/Confirmation";
import NewService from "../components/modal/NewService";

import { Service } from "../../generated/definitions/commons/Service";

import { SubscriptionCollection } from "../../generated/definitions/backend/SubscriptionCollection";
import { SubscriptionContract } from "../../generated/definitions/backend/SubscriptionContract";
import { UserData } from "../../generated/definitions/backend/UserData";

import { MsalConfig } from "../../generated/definitions/backend/MsalConfig";
import { PublicConfig } from "../../generated/definitions/backend/PublicConfig";
import {
  getServiceReviewStatus,
  ServiceStatus,
  ValidService
} from "../utils/service";

import ApiKey from "../components/subscriptions/ApiKey";
import ServiceCard from "../components/subscriptions/ServiceCard";
import SubscriptionsFilter, {
  OptionValueLabel
} from "../components/subscriptions/SubscriptionsFilter";
import SubscriptionsLoader from "../components/subscriptions/SubscriptionsLoader";

const getMail = (email: string) =>
  email && email !== "" ? atob(email) : undefined;

const SUBSCRIPTIONS_CURRENT_PAGE_SIZE_KEY = "subscriptionsPageSize";

type Props = RouteComponentProps<{ email: string }> & WithNamespaces;

function isString<T>(value: T | string): value is string {
  return typeof value === "string";
}

interface UserSubscriptions {
  [key: string]: SubscriptionContract;
}

type ProfileState = {
  applicationConfig: PublicConfig;
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
  manageSubscription?: SubscriptionContract;
  collapseManageKey: boolean;
  maskedManageKeys: {
    primary: boolean;
    secondary: boolean;
  };
  services: { [serviceId: string]: Service };
  isConfirmationOpen: boolean;
  onConfirmOperation: () => void;
  serviceState: { [serviceId: string]: string };
  showModal: boolean;
  subscriptionsOffset: number;
  hasMoreSubscriptions: boolean;
  areSubscriptionsLoading: boolean;
  subscriptionsCurrentPageSize: OptionValueLabel;
};

class Profile extends Component<Props, ProfileState> {
  public state: ProfileState = {
    userData: {},
    userSubscriptions: {},
    manageSubscription: undefined,
    collapseManageKey: true,
    maskedManageKeys: {
      primary: true,
      secondary: true
    },
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
    isConfirmationOpen: false,
    onConfirmOperation: () => undefined,
    showModal: false,
    subscriptionsOffset: 0,
    hasMoreSubscriptions: true,
    areSubscriptionsLoading: true,
    subscriptionsCurrentPageSize: this.getCurrentPageSize()
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

  private getSubscriptionDefaults(applicationConfig: PublicConfig) {
    // prepopulate new subscription form with values from authenticated user
    // TODO: do this for admins (email = true) as well
    const storedUserData = getStorage().userData;
    if (MsalConfig.is(applicationConfig)) {
      return {
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
      };
    } else {
      return {
        newSubscription: {
          service_name: "", // storedUserData.extension_Service,
          department_name: "-", // storedUserData.extension_Department,
          organization_name: storedUserData.organization.id, // storedUserData.extension_Organization,
          organization_fiscal_code: storedUserData.organization.fiscal_code,
          new_user: {
            adb2c_id: storedUserData.oid,
            first_name: "-", // storedUserData.given_name,
            last_name: "-", // storedUserData.family_name,
            email: `org.${storedUserData.organization.id}@selfcare.io.pagopa.it`
          }
        }
      };
    }
  }

  public async componentDidMount() {
    const email = getMail(this.props.match.params.email);

    const applicationConfig = await getFromBackend<PublicConfig>({
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
      this.setState(this.getSubscriptionDefaults(applicationConfig));
    }

    // load manage subscription
    const userGroups = get(this.state, "userData.apimUser.groupNames");
    if (userGroups && userGroups.indexOf("apiservicewrite") !== -1) {
      await this.loadManageSubscription(email);
    }

    // load user's subscriptions (paginated)
    await this.loadUserSubscriptions(this.state.subscriptionsOffset);
  }

  private async loadManageSubscription(email?: string) {
    const subscription: SubscriptionContract = await getFromBackend<
      SubscriptionContract
    >({
      path:
        "subscription-manage" + (email ? "/" + encodeURIComponent(email) : "")
    });
    this.setState({ manageSubscription: subscription });
  }

  private async loadUserSubscriptions(
    offset: number,
    filterBySubscriptionName?: string
  ) {
    this.setState({ areSubscriptionsLoading: true });

    const email = getMail(this.props.match.params.email);

    const userSubscriptions: SubscriptionCollection = await getFromBackend<
      SubscriptionCollection
    >({
      path:
        "subscriptions" +
        (email ? "/" + encodeURIComponent(email) : "") +
        `?offset=${offset}&limit=${
          this.state.subscriptionsCurrentPageSize.value
        }` +
        (filterBySubscriptionName ? `&name=${filterBySubscriptionName}` : "")
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
      userSubscriptions: {
        ...this.state.userSubscriptions,
        ...userSubscriptionsObj
      },
      subscriptionsOffset: offset,
      hasMoreSubscriptions:
        userSubscriptions["nextLink" as keyof typeof userSubscriptions] !==
        undefined,
      areSubscriptionsLoading: false
    });

    // load all services related to the user's subscriptions
    Object.keys(userSubscriptionsObj).forEach(async subscriptionKey => {
      const subscription = userSubscriptionsObj[subscriptionKey];
      const service: Service = await getFromBackend<Service>({
        path: `services/${subscription.name}`
      });
      this.checkService(service);
      this.setState(prevState => ({
        services: { ...prevState.services, [service.service_id]: service }
      }));
    });
  }

  private getCurrentPageSize() {
    this.setSessionStorageCurrentPageSize(
      this.getSessionStorageCurrentPageSize()
    );
    this.setState({
      subscriptionsCurrentPageSize: this.getSessionStorageCurrentPageSize()
    });
    return this.getSessionStorageCurrentPageSize();
  }

  private getSessionStorageCurrentPageSize() {
    const result = sessionStorage.getItem(SUBSCRIPTIONS_CURRENT_PAGE_SIZE_KEY);
    if (result) {
      return JSON.parse(result) as OptionValueLabel;
    } else {
      return { label: "20", value: 20 } as OptionValueLabel;
    }
  }

  private setSessionStorageCurrentPageSize(value: OptionValueLabel) {
    sessionStorage.setItem(
      SUBSCRIPTIONS_CURRENT_PAGE_SIZE_KEY,
      JSON.stringify(value)
    );
  }

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

  public renderUserInfo() {
    const { t } = this.props;
    const userGroups = get(this.state, "userData.apimUser.groupNames");
    const applicationConfig = get(this.state, "applicationConfig");
    const isSelfCare = !MsalConfig.is(applicationConfig);
    const { maskedManageKeys } = this.state;

    const SubscriptionOwnerName = () => (
      <h4>
        {" "}
        {isSelfCare
          ? `Organizzazione: ${get(
              this.state,
              "userData.authenticatedUser.organization.name"
            )}`
          : get(this.state, "userData.apimUser.email", t("new_user"))}
      </h4>
    );

    const AccountInfo = () => {
      if (isSelfCare) {
        return <></>;
      }

      const isSameUser = !this.props.match.params.email;
      const firstName = get(this.state, "userData.apimUser.firstName");
      const lastName = get(this.state, "userData.apimUser.lastName");
      return (
        <div className="col-md-8">
          {firstName && (
            <div>
              {t("name")}: <strong>{firstName}</strong>
            </div>
          )}
          {lastName && (
            <div>
              {t("surname")}: <strong>{lastName}</strong>
            </div>
          )}
          {isSameUser &&
            "changePasswordLink" in this.state.applicationConfig &&
            this.state.applicationConfig.changePasswordLink && (
              <div>
                <a href={this.state.applicationConfig.changePasswordLink}>
                  {t("change_password")}
                </a>
              </div>
            )}
        </div>
      );
    };

    return (
      <div>
        <SubscriptionOwnerName />
        <div className="row">
          <AccountInfo />
          <div className="col-md-4 text-right">
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

        {userGroups && userGroups.indexOf("apiservicewrite") !== -1 ? (
          this.state.manageSubscription ? (
            <ApiKey
              subscription={this.state.manageSubscription}
              headerInfo={{
                header: "Chiave API Manage",
                content:
                  "Utilizza la chiave Manage per operazioni programmatiche di creazione o aggiornamento di un servizio."
              }}
              showUseKeyAction={false}
              collapseSecondaryKey={this.state.collapseManageKey}
              maskedKeys={this.state.maskedManageKeys}
              additionalClass="px-4 py-3 my-3"
              onRegenerateKey={(keyType, subscriptionId) =>
                this.regenerateKey(keyType, subscriptionId)
              }
              onCollapseChange={value =>
                this.setState({ collapseManageKey: value })
              }
              onMaskChange={(keyType, masked) =>
                this.setState({
                  maskedManageKeys: {
                    ...maskedManageKeys,
                    [keyType as keyof typeof maskedManageKeys]: masked
                  }
                })
              }
            />
          ) : null
        ) : null}

        <div className="row">
          <div className="col-md">
            <p className="mt-4">
              Autorizzazioni:{" "}
              {userGroups
                ? userGroups.map((userGroup: string, index: number) => (
                    <Badge
                      key={index}
                      color="secondary"
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
                        padding: "6px 8px",
                        margin: "0 4px 4px 0"
                      }}
                      pill={true}
                    >
                      {userGroup}
                    </Badge>
                  ))
                : ""}
            </p>
            <p>
              Limitato:{" "}
              {userGroups && userGroups.indexOf("apimessagewrite") !== -1 ? (
                <strong>NO</strong>
              ) : (
                <strong>SI</strong>
              )}
            </p>
          </div>
        </div>
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
      // tslint:disable-next-line: no-floating-promises
      getServiceReviewStatus(service)
        .fold(
          _ =>
            this.setState({
              serviceState: {
                ...this.state.serviceState,
                [serviceId]: ServiceStatus.NOT_FOUND
              }
            }),
          res => {
            this.setState({
              serviceState: {
                ...this.state.serviceState,
                [serviceId]: res.status
              }
            });
          }
        )
        .run();
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
        allowOrganizationFiscalCode={MsalConfig.is(
          get(this.state, "applicationConfig")
        )}
      />
    );
  }

  private regenerateKey(keyType: string, subscriptionId: string) {
    this.setState({
      isConfirmationOpen: true,
      onConfirmOperation: async () => {
        const userSubscription: SubscriptionContract = await putToBackend<
          SubscriptionContract
        >({
          path: `subscriptions/${subscriptionId}/${keyType}_key`,
          options: { body: undefined }
        });
        this.updateSubscriptionKeys(userSubscription);
      }
    });
  }

  private updateSubscriptionKeys(userSubscription: SubscriptionContract) {
    this.setState(prevState => ({
      isConfirmationOpen: false,
      userSubscriptions: isString(userSubscription.name)
        ? {
            ...prevState.userSubscriptions,
            [userSubscription.name]: userSubscription
          }
        : prevState.userSubscriptions,
      manageSubscription:
        isString(userSubscription.name) &&
        userSubscription.name.startsWith("MANAGE-")
          ? userSubscription
          : prevState.manageSubscription
    }));
  }

  public render() {
    const {
      userSubscriptions,
      services,
      isConfirmationOpen,
      subscriptionsCurrentPageSize,
      onConfirmOperation
    } = this.state;
    const { t } = this.props;

    const handleSubscriptionsPageSizeChange = (
      newPageSize: OptionValueLabel
    ) => {
      this.setState({
        subscriptionsOffset: 0,
        subscriptionsCurrentPageSize: { ...newPageSize },
        userSubscriptions: {}
      });
      this.setSessionStorageCurrentPageSize(newPageSize);
      void this.componentDidMount();
    };

    const handleSubscriptionSearch = (subscriptionId: string) => {
      this.setState({ subscriptionsOffset: 0, userSubscriptions: {} });
      void this.loadUserSubscriptions(0, subscriptionId);
    };

    const handleSubscriptionSearchClear = () => {
      this.setState({ subscriptionsOffset: 0, userSubscriptions: {} });
      void this.loadUserSubscriptions(0);
    };

    return (
      <div className="mx-4 px-5">
        {this.state.showModal && this.renderModal()}
        {this.renderUserInfo()}

        <div>
          <h4 className="mt-3">{t("services")}</h4>

          <SubscriptionsFilter
            subscriptionsPageSizeOptions={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 50, label: "50" },
              { value: 100, label: "100" }
            ]}
            subscriptionsDefaultPageSize={subscriptionsCurrentPageSize}
            onSubscriptionSearchClear={handleSubscriptionSearchClear}
            onSubscriptionSearchClick={handleSubscriptionSearch}
            onSubscriptionsPageSizeChange={handleSubscriptionsPageSizeChange}
          />

          {Object.keys(userSubscriptions).reduce<ReadonlyArray<JSX.Element>>(
            (jsxElementsArray, key) => {
              const subscription = userSubscriptions[key];
              if (!isString(subscription.name)) {
                return jsxElementsArray;
              }
              const service = services[subscription.name];
              return [
                ...jsxElementsArray,
                <ServiceCard
                  key={key}
                  subscription={subscription}
                  service={service}
                  status={this.renderServiceStatus(service)}
                  onRegenerateKey={(keyType, subscriptionId) =>
                    this.regenerateKey(keyType, subscriptionId)
                  }
                />
              ];
            },
            []
          )}
        </div>

        <SubscriptionsLoader
          areSubscriptionsLoading={this.state.areSubscriptionsLoading}
          hasMoreSubscriptions={this.state.hasMoreSubscriptions}
          onClick={() => {
            void this.loadUserSubscriptions(
              this.state.subscriptionsOffset +
                subscriptionsCurrentPageSize.value
            );
          }}
        />

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
