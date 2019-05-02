import React, { ChangeEvent, Component, Fragment } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Button } from "design-react-kit";

import get from "lodash/get";
import { getStorage } from "../context/storage";

import { getFromBackend, postToBackend, putToBackend } from "../utils/backend";

import FaEye from "react-icons/lib/fa/eye";
import FaEyeSlash from "react-icons/lib/fa/eye-slash";

import { RouteComponentProps } from "react-router";
import Confirmation from "../components/modal/Confirmation";

const getMail = (email: string) =>
  email && email !== "" ? atob(email) : undefined;

const SubscriptionService = ({ service, t }: any) => {
  return service ? (
    <div>
      <h5>{service.service_id}</h5>
      <div>
        {t("service:name")}: {service.service_name}
      </div>
      <div>
        {t("service:department")}: {service.department_name}
      </div>
      <div>
        {t("service:organization")}: {service.organization_name}
      </div>
      <div>
        {t("service:organization_fiscal_code")}:{" "}
        {service.organization_fiscal_code}
      </div>
      <div>
        {t("service:authorized_recipients")}: {service.authorized_recipients}
      </div>
      <div>
        {t("service:authorized_ips")}: {service.authorized_ips}
      </div>
      <div>
        {t("service:max_allowed_payment_amount")}:{" "}
        {service.max_allowed_payment_amount} {t("service:eurocents")}
      </div>
      <a href={`/service/${service.service_id}`}>{t("service:edit")}</a>
    </div>
  ) : null;
};

type ProfileProps = RouteComponentProps<{ email: string }> & WithNamespaces;

type ProfileState = {
  applicationConfig: any;
  userData: any;
  newSubscription: {
    service_name?: any;
    department_name?: any;
    organization_name?: any;
    organization_fiscal_code?: string;
    new_user?: { adb2c_id: any; first_name: any; last_name: any; email: any };
  };
  userSubscriptions: any;
  [x: string]: any;
  services: any;
  isConfirmationOpen: boolean;
  onConfirmOperation: () => void;
};

class Profile extends Component<ProfileProps, ProfileState> {
  public state: ProfileState = {
    userData: {},
    userSubscriptions: {},
    services: {},
    applicationConfig: {},
    newSubscription: {},
    isConfirmationOpen: false,
    onConfirmOperation: () => undefined
  };

  public onAddSubscription = async () => {
    const email = getMail(this.props.match.params.email);

    const userSubscription = await postToBackend({
      path: "subscriptions" + (email ? "/" + encodeURIComponent(email) : ""),
      options: {
        body: Object.assign(
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
      }
    });

    this.setState({
      userSubscriptions: {
        ...this.state.userSubscriptions,
        [userSubscription.name]: userSubscription
      }
    });

    const service = await getFromBackend({
      path: `services/${userSubscription.name}`
    });

    this.setState({
      services: { ...this.state.services, [service.service_id]: service }
    });
  };

  public async componentDidMount() {
    const email = getMail(this.props.match.params.email);

    const applicationConfig = await getFromBackend({ path: "configuration" });
    this.setState({ applicationConfig });

    const userData = await getFromBackend({
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
    const userSubscriptions = await getFromBackend({
      path: "subscriptions" + (email ? "/" + encodeURIComponent(email) : "")
    });

    const userSubscriptionsObj: { [key: string]: any } = Object.keys(
      userSubscriptions
    ).reduce<{ [key: string]: any }>(
      (p, key) =>
        isNaN(Number(key))
          ? p
          : {
              ...p,
              [userSubscriptions[key].name]: userSubscriptions[key]
            },
      {}
    );

    this.setState({
      userSubscriptions: userSubscriptionsObj
    });

    // load all services related to the user's subscriptions
    Object.keys(userSubscriptionsObj).forEach(async subscriptionKey => {
      const subscription = userSubscriptionsObj[subscriptionKey];
      const service = await getFromBackend({
        path: `services/${subscription.name}`
      });
      this.setState({
        services: { ...this.state.services, [service.service_id]: service }
      });
    });
  }

  public onToggleKey(keyIdx: string) {
    this.setState({ [keyIdx]: !this.state[keyIdx] });
  }

  public onSetKey = (serviceKey: string, service: any) => () => {
    localStorage.setItem("serviceKey", serviceKey);
    localStorage.setItem("service", JSON.stringify(service));
    window.location.replace("/compose");
  };

  public onRegenerateKey = (
    keyType: string,
    subscriptionId: string
  ) => async () => {
    this.setState({
      isConfirmationOpen: true,
      onConfirmOperation: async () => {
        const userSubscription = await putToBackend({
          path: "subscriptions/" + subscriptionId + "/" + keyType + "_key",
          options: { body: undefined }
        });
        this.setState({
          isConfirmationOpen: false,
          userSubscriptions: {
            ...this.state.userSubscriptions,
            [userSubscription.name]: userSubscription
          }
        });
      }
    });
  };

  public handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      newSubscription: {
        ...this.state.newSubscription,
        [name]: value
      }
    });
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
        {isSameUser && (
          <div>
            <a href={this.state.applicationConfig.changePasswordLink}>
              {t("change_password")}
            </a>
          </div>
        )}
        <p
          style={{ maxWidth: "30em", wordWrap: "break-word" }}
          className="mt-4"
        >
          Autorizzazioni: {userGroups && userGroups.join(",")}
        </p>
        <p>
          Limitato:{" "}
          {userGroups && userGroups.indexOf("ApiMessageWrite") !== -1
            ? "no"
            : "si"}
        </p>
      </div>
    );
  }

  public render() {
    const { userSubscriptions, services } = this.state;
    const { isConfirmationOpen, onConfirmOperation } = this.state;
    const { t } = this.props;

    return (
      <Fragment>
        {this.renderNewUserDiv()}
        <div>
          <h4 className="mt-4">{t("services")}</h4>
          {Object.keys(userSubscriptions).map(subscriptionName => {
            const subscription = userSubscriptions[subscriptionName];
            const service = services[subscription.name];

            return (
              <div key={subscription.id} className="shadow p-4 my-4">
                <SubscriptionService service={service} t={t} />
                <h6 className="mt-4">
                  {t("subscription")} ({subscription.state})
                </h6>
                <div className="my-2">
                  {t("primary_key")}:{" "}
                  {this.state[`p_${subscription.name}`]
                    ? subscription.primaryKey
                    : t("key")}
                  <Button
                    outline={true}
                    color="primary"
                    size="xs"
                    className="ml-1 mr-1"
                    onClick={() => this.onToggleKey(`p_${subscription.name}`)}
                  >
                    {this.state[`p_${subscription.name}`] ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </Button>
                  <Button
                    color="danger"
                    size="xs"
                    className="mr-1"
                    disabled={!service || subscription.state !== "active"}
                    onClick={this.onRegenerateKey("primary", subscription.name)}
                  >
                    {t("regenerate")}
                  </Button>
                  <Button
                    color="primary"
                    size="xs"
                    className="mr-1"
                    disabled={!service || subscription.state !== "active"}
                    onClick={this.onSetKey(subscription.primaryKey, service)}
                  >
                    {t("use")}
                  </Button>
                </div>
                <div className="my-2">
                  {t("secondary_key")}:{" "}
                  {this.state[`s_${subscription.name}`]
                    ? subscription.secondaryKey
                    : t("key")}
                  <Button
                    outline={true}
                    color="primary"
                    size="xs"
                    className="ml-1 mr-1"
                    onClick={() => this.onToggleKey(`s_${subscription.name}`)}
                  >
                    {this.state[`s_${subscription.name}`] ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </Button>
                  <Button
                    color="danger"
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
                    onClick={this.onSetKey(subscription.secondaryKey, service)}
                  >
                    {t("use")}
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="shadow p-4 mt-5">
            <label>{t("service:name")}</label>
            <input
              name="service_name"
              type="text"
              defaultValue={get(this.state, "newSubscription.service_name")}
              onChange={this.handleInputChange}
            />
            <label>{t("service:department")}</label>
            <input
              name="department_name"
              type="text"
              defaultValue={get(this.state, "newSubscription.department_name")}
              onChange={this.handleInputChange}
            />
            <label>{t("service:organization")}</label>
            <input
              name="organization_name"
              type="text"
              defaultValue={get(
                this.state,
                "newSubscription.organization_name"
              )}
              onChange={this.handleInputChange}
            />
            <label>{t("service:organization_fiscal_code")}</label>
            <input
              name="organization_fiscal_code"
              type="text"
              defaultValue={get(
                this.state,
                "newSubscription.organization_fiscal_code"
              )}
              onChange={this.handleInputChange}
            />

            <Button
              className="mt-3"
              color="primary"
              onClick={this.onAddSubscription}
            >
              {t("add")}
            </Button>
          </div>
        </div>

        <Confirmation
          isOpen={isConfirmationOpen}
          onCancel={() => this.setState({ isConfirmationOpen: false })}
          onConfirm={onConfirmOperation}
        />
      </Fragment>
    );
  }
}

export default withNamespaces(["profile", "service"])(Profile);
