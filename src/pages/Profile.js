import React, { Component, Fragment } from "react";

import { Button } from "design-react-kit";

import get from "lodash/get";

import { getFromBackend, postToBackend, putToBackend } from "../utils/backend";

import FaEye from "react-icons/lib/fa/eye";
import FaEyeSlash from "react-icons/lib/fa/eye-slash";

const getMail = email => (email && email !== "" ? atob(email) : undefined);

const SubscriptionService = ({ service }) => {
  return service ? (
    <div>
      <h5>{service.service_id}</h5>
      <div>Nome servizio: {service.service_name}</div>
      <div>Dipartimento: {service.department_name}</div>
      <div>Ente: {service.organization_name}</div>
      <div>Codice fiscale ente: {service.organization_fiscal_code}</div>
      <div>Codici fiscali autorizzati: {service.authorized_recipients}</div>
      <div>IP di origine autorizzati: {service.authorized_ips}</div>
      <div>Importo massimo: {service.max_allowed_payment_amount} eurocents</div>
      <a href={"/service/" + service.service_id}>
        Modifica i dati del servizio
      </a>
    </div>
  ) : null;
};

export default class Profile extends Component {
  state = {
    userData: {},
    userSubscriptions: {},
    services: {},
    applicationConfig: {},
    newSubscription: {}
  };

  onAddSubscription = async () => {
    const email = getMail(this.props.match.params.email);

    const userSubscription = await postToBackend({
      path: "subscriptions" + (email ? "/" + encodeURIComponent(email) : ""),
      options: {
        body: {
          organization_fiscal_code: this.state.newSubscription
            .organization_fiscal_code,
          organization_name: this.state.newSubscription.organization_name,
          department_name: this.state.newSubscription.department_name,
          service_name: this.state.newSubscription.service_name
        }
      }
    });

    this.setState({
      userSubscriptions: {
        ...this.state.userSubscriptions,
        [userSubscription.name]: userSubscription
      }
    });

    const service = await getFromBackend({
      path: "services/" + userSubscription.name
    });

    this.setState({
      services: { ...this.state.services, [service.service_id]: service }
    });
  };

  async componentDidMount() {
    const email = getMail(this.props.match.params.email);

    const applicationConfig = await getFromBackend({ path: "configuration" });
    this.setState({ applicationConfig });

    const userData = await getFromBackend({
      path: "user" + (email ? "/" + encodeURIComponent(email) : "")
    });
    this.setState({
      userData,
      // populate new subscription form with default data taken from the user's profile
      newSubscription: {
        service_name: userData.authenticatedUser.extension_Service,
        department_name: userData.authenticatedUser.extension_Department,
        organization_name: userData.authenticatedUser.extension_Organization,
        organization_fiscal_code: "00000000000"
      }
    });

    // load all user's subscriptions
    const userSubscriptions = await getFromBackend({
      path: "subscriptions" + (email ? "/" + encodeURIComponent(email) : "")
    });

    const userSubscriptionsObj = Object.keys(userSubscriptions).reduce(
      (p, key) =>
        isNaN(key)
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
        path: "services/" + subscription.name
      });
      this.setState({
        services: { ...this.state.services, [service.service_id]: service }
      });
    });
  }

  onToggleKey(keyIdx) {
    this.setState({ [keyIdx]: !this.state[keyIdx] });
  }

  onSetKey = (serviceKey, service) => () => {
    localStorage.setItem("serviceKey", serviceKey);
    localStorage.setItem("service", JSON.stringify(service));
    window.location.replace("/compose");
  };

  onRegenerateKey = (keyType, subscriptionId) => async () => {
    const userSubscription = await putToBackend({
      path: "subscriptions/" + subscriptionId + "/" + keyType + "_key",
      options: { body: undefined }
    });
    this.setState({
      userSubscriptions: {
        ...this.state.userSubscriptions,
        [userSubscription.name]: userSubscription
      }
    });
  };

  handleInputChange = event => {
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

  render() {
    const { userSubscriptions, services } = this.state;
    const isSameUser = !this.props.match.params.email;
    const keyPlaceholder = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    return (
      <Fragment>
        <div>
          <h4>{get(this.state, "userData.apimUser.email")}</h4>
          <div>Nome: {get(this.state, "userData.apimUser.firstName")}</div>
          <div>Cognome: {get(this.state, "userData.apimUser.lastName")}</div>
          {isSameUser && (
            <div>
              <a href={this.state.applicationConfig.changePasswordLink}>
                Cambia password
              </a>
            </div>
          )}
        </div>
        <div>
          <h4 className="mt-4">Servizi registrati</h4>
          {Object.keys(userSubscriptions).map(subscriptionName => {
            const subscription = userSubscriptions[subscriptionName];
            const service = services[subscription.name];

            return (
              <div key={subscription.id} className="shadow p-4 my-4">
                <SubscriptionService service={service} />
                <h6 className="mt-4">Sottoscrizione ({subscription.state})</h6>
                <div className="my-2">
                  Chiave primaria:{" "}
                  {this.state["p_" + subscription.name]
                    ? subscription.primaryKey
                    : keyPlaceholder}
                  <Button
                    outline
                    color="primary"
                    size="xs"
                    className="ml-1 mr-1"
                    onClick={() => this.onToggleKey("p_" + subscription.name)}
                  >
                    {this.state["p_" + subscription.name] ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </Button>
                  <Button
                    color="danger"
                    size="xs"
                    className="mr-1"
                    onClick={this.onRegenerateKey("primary", subscription.name)}
                  >
                    Rigenera
                  </Button>
                  <Button
                    color="primary"
                    size="xs"
                    className="mr-1"
                    disabled={!service || subscription.state !== "active"}
                    onClick={this.onSetKey(subscription.primaryKey, service)}
                  >
                    Usa questa chiave
                  </Button>
                </div>
                <div className="my-2">
                  Chiave secondaria:{" "}
                  {this.state["s_" + subscription.name]
                    ? subscription.secondaryKey
                    : keyPlaceholder}
                  <Button
                    outline
                    color="primary"
                    size="xs"
                    className="ml-1 mr-1"
                    onClick={() => this.onToggleKey("s_" + subscription.name)}
                  >
                    {this.state["s_" + subscription.name] ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </Button>
                  <Button
                    color="danger"
                    size="xs"
                    className="mr-1"
                    onClick={this.onRegenerateKey(
                      "secondary",
                      subscription.name
                    )}
                  >
                    Rigenera
                  </Button>
                  <Button
                    color="primary"
                    size="xs"
                    className="mr-1"
                    disabled={!service || subscription.state !== "active"}
                    onClick={this.onSetKey(subscription.secondaryKey, service)}
                  >
                    Usa questa chiave
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="shadow p-4 mt-5">
            <label>Nome servizio</label>
            <input
              name="service_name"
              type="text"
              defaultValue={get(this.state, "newSubscription.service_name")}
              onChange={this.handleInputChange}
            />
            <label>Dipartimento</label>
            <input
              name="department_name"
              type="text"
              defaultValue={get(this.state, "newSubscription.department_name")}
              onChange={this.handleInputChange}
            />
            <label>Ente</label>
            <input
              name="organization_name"
              type="text"
              defaultValue={get(
                this.state,
                "newSubscription.organization_name"
              )}
              onChange={this.handleInputChange}
            />
            <label>Codice fiscale ente</label>
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
              color="primary"
              className="mt-3"
              color="primary"
              onClick={this.onAddSubscription}
            >
              Aggiungi sottoscrizione
            </Button>
          </div>
        </div>
      </Fragment>
    );
  }
}
