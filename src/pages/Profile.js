import React, { Component, Fragment } from "react";
import get from "lodash/get";
import { getFromBackend, postToBackend, putToBackend } from "../utils/backend";
import { Button } from "design-react-kit";

const getMail = (email) => email && email !== "" ? atob(email) : undefined;

function SubscriptionService(props) {
  const { service } = props;
  return service ? (
    <div className="">
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
  ) : null
}

export default class Profile extends Component {
  state = {
    userData: {},
    userSubscriptions: {},
    services: {},
    applicationConfig: {},
    newSubscription: {}
  };

  onAddSubscription = async () => {
    const self = this;
    const email = getMail(self.props.match.params.email);

    const userSubscription = await postToBackend({
      path:
        "subscriptions" + (email ? "/" + encodeURIComponent(email) : ""),
      options: {
        body: {
          organization_fiscal_code: self.state.newSubscription.organization_fiscal_code,
          organization_name: self.state.newSubscription.organization_name,
          department_name: self.state.newSubscription.department_name,
          service_name: self.state.newSubscription.service_name
        }
      }
    });

    console.debug("added subscription", userSubscription);

    self.setState({
      userSubscriptions: { ...self.state.userSubscriptions, [userSubscription.name]: userSubscription }
    });

    const service = await getFromBackend({
      path:
        "services/" + userSubscription.name
    });

    self.setState({
      services: { ...self.state.services, [service.service_id]: service }
    });
  }

  async componentDidMount() {
    const self = this;
    const email = getMail(self.props.match.params.email);

    console.debug("Profile with email", email);

    const applicationConfig = await getFromBackend({ path: "configuration" });
    this.setState({ applicationConfig });

    const userData = await getFromBackend({ path: "user" + (email ? "/" + encodeURIComponent(email) : "") });
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
      path:
        "subscriptions" + (email ? "/" + encodeURIComponent(email) : "")
    });

    const userSubscriptionsObj = Object.keys(userSubscriptions).reduce((p, key) => (
      isNaN(key) ? p :
        {
          ...p,
          [userSubscriptions[key].name]: userSubscriptions[key]
        }), {});

    this.setState({
      userSubscriptions: userSubscriptionsObj
    });

    // load all services related to the user's subscriptions
    Object.keys(userSubscriptionsObj).forEach(async subscriptionKey => {
      const subscription = userSubscriptionsObj[subscriptionKey];
      const service = await getFromBackend({
        path:
          "services/" + subscription.name
      });
      this.setState({
        services: { ...this.state.services, [service.service_id]: service }
      });
    });
  }

  onToggleKey(keyIdx) {
    this.setState({ [keyIdx]: !this.state[keyIdx] })
  }

  onSetKey = (serviceKey, service) => () => {
    localStorage.setItem("serviceKey", serviceKey);
    localStorage.setItem("service", JSON.stringify(service));
    window.location.replace("/compose");
  }

  onRegenerateKey = (keyType, subscriptionId) => async () => {
    const self = this;
    const userSubscription = await putToBackend({
      path:
        "subscriptions/" + subscriptionId + "/" + keyType + "_key",
      options: { body: undefined }
    });
    self.setState({
      userSubscriptions: { ...self.state.userSubscriptions, [userSubscription.name]: userSubscription }
    });
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      newSubscription: {
        ...this.state.newSubscription,
        [name]: value
      }
    });
  }

  render() {
    const keyPlaceholder = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    return (
      <Fragment>
        <div>
          <h4>{get(this.state, "userData.apimUser.email")}</h4>
          <div>Nome: {get(this.state, "userData.apimUser.firstName")}</div>
          <div>Cognome: {get(this.state, "userData.apimUser.lastName")}</div>
          <div><a href={this.state.applicationConfig.changePasswordLink}>Cambia password</a></div>
        </div>
        <div>
          <h4 className="mt-4">Servizi registrati</h4>
          {Object.keys(this.state.userSubscriptions).map(subscriptionName => {
            const subscription = this.state.userSubscriptions[subscriptionName];
            const service = this.state.services[subscription.name];
            return (
              <div key={subscription.id} className="shadow p-4 my-4">
                <SubscriptionService service={service}></SubscriptionService>
                <h6 className="mt-4">Sottoscrizione ({subscription.state})</h6>
                <div className="my-2">Chiave primaria: {this.state['p_' + subscription.name] ? subscription.primaryKey : keyPlaceholder}
                  <Button size="xs" className="ml-1 mr-1" onClick={() => this.onToggleKey('p_' + subscription.name)}>{this.state['p_' + subscription.name] ?
                    'nascondi' : 'mostra'}</Button>
                  <Button size="xs" className="mr-1" onClick={this.onRegenerateKey('primary', subscription.name)}>rigenera</Button>
                  <Button size="xs" className="mr-1" onClick={this.onSetKey(subscription.primaryKey, service)}>usa questa chiave</Button>
                </div>
                <div className="my-2">Chiave secondaria: {this.state['s_' + subscription.name] ? subscription.secondaryKey : keyPlaceholder}
                  <Button size="xs" className="ml-1 mr-1" onClick={() => this.onToggleKey('s_' + subscription.name)}>{this.state['s_' + subscription.name] ?
                    'nascondi' : 'mostra'}</Button>
                  <Button size="xs" className="mr-1" onClick={this.onRegenerateKey('secondary', subscription.name)}>rigenera</Button>
                  <Button size="xs" className="mr-1" onClick={this.onSetKey(subscription.secondaryKey, service)}>usa questa chiave</Button>
                </div>
              </div>
            )
          })
          }

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
              defaultValue={get(this.state, "newSubscription.organization_name")}
              onChange={this.handleInputChange}
            />
            <label>Codice fiscale ente</label>
            <input
              name="organization_fiscal_code"
              type="text"
              defaultValue={get(this.state, "newSubscription.organization_fiscal_code")}
              onChange={this.handleInputChange}
            />

            <Button className="mt-3" onClick={this.onAddSubscription}>Aggiungi sottoscrizione</Button>
          </div>
        </div>
      </Fragment >
    );
  }
}