import React, { Component } from "react";
import { Button } from "design-react-kit";
import { getFromBackend, putToBackend } from "../utils/backend";

export default class SubscriptionService extends Component {
  state = {
    userToken: localStorage.getItem("userToken")
  };

  async componentDidMount() {
    const serviceId = this.props.match.params.service_id;
    const service = await getFromBackend({
      path: "services/" + serviceId
    });
    this.setState({
      service
    });
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      service: {
        ...this.state.service,
        [name]: value
      }
    });
  };

  handleSubmit = async () => {
    const service = this.state.service;
    const res = await putToBackend({
      path: "services/" + service.service_id,
      options: {
        // limit fields to editable ones
        body: {
          organization_fiscal_code: service.organization_fiscal_code,
          organization_name: service.organization_name,
          department_name: service.department_name,
          service_name: service.service_name
        }
      }
    });
  };

  render() {
    const service = this.state.service;
    return service ? (
      <div>
        <h4>Servizio {service.service_id}</h4>
        <form className="mb-5 mt-1">
          <label className="m-0">Nome servizio</label>
          <input
            name="service_name"
            type="text"
            defaultValue={service.service_name}
            onChange={this.handleInputChange}
            className="mb-4"
          />

          <label className="m-0">Dipartimento</label>
          <input
            name="department_name"
            type="text"
            defaultValue={service.department_name}
            onChange={this.handleInputChange}
            className="mb-4"
          />

          <label className="m-0">Ente</label>
          <input
            name="organization_name"
            type="text"
            defaultValue={service.organization_name}
            onChange={this.handleInputChange}
            className="mb-4"
          />

          <label className="m-0">Codice fiscale ente</label>
          <input
            name="organization_fiscal_code"
            type="text"
            defaultValue={service.organization_fiscal_code}
            onChange={this.handleInputChange}
            className="mb-4"
          />

          <Button color="primary" onClick={this.handleSubmit}>Salva i dati del servizio</Button>
        </form>

        {service.authorized_recipients.length > 0 && (
          <div className="mb-3">
            Codici fiscali destinatari autorizzati:{" "}
            {service.authorized_recipients}
          </div>
        )}

        {service.authorized_cidrs.length > 0 && (
          <div className="mb-3">
            IP di origine autorizzati: {service.authorized_cidrs}
          </div>
        )}

        {service.max_allowed_payment_amount && (
          <div className="mb-3">
            Importo massimo autorizzato: {service.max_allowed_payment_amount}{" "}
            eurocents
          </div>
        )}
      </div>
    ) : null;
  }
}
