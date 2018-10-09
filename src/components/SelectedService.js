import React, { Component } from "react";

export default class Service extends Component {
  state = {};

  componentDidMount() {
    const serviceStr = localStorage.getItem("service");
    this.setState({ serviceData: serviceStr ? JSON.parse(serviceStr) : undefined });
  }

  render() {
    return this.state.serviceData ? (
      <p>Invio per conto di{' '}
        {this.state.serviceData.organization_name}{' '}/{' '}
        {this.state.serviceData.service_name}{' '}
        [<a href={'/service/' + this.state.serviceData.service_id}>{this.state.serviceData.service_id}</a>]
      </p>
    ) : <p>Nessuna API key selezionata !</p>
  }
}
