import React, { Component } from "react";

import { Alert } from "design-react-kit";

export default class Service extends Component {
  state = {
    serviceData: undefined
  };

  componentDidMount() {
    const service = localStorage.getItem("service");
    this.setState({
      serviceData: service ? JSON.parse(service) : undefined
    });
  }

  render() {
    const { serviceData } = this.state;
    return serviceData ? (
      <p>
        Invio per conto di {serviceData.organization_name} /{" "}
        {serviceData.service_name} [
        <a href={"/service/" + serviceData.service_id}>
          {serviceData.service_id}
        </a>
        ]
      </p>
    ) : (
      <Alert color="danger">Nessuna API key selezionata !</Alert>
    );
  }
}
