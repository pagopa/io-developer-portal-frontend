import React, { Component } from "react";

import { Alert } from "design-react-kit";

import { StorageContext } from "../context/storage";

export default class Service extends Component {
  render() {
    return (
      <StorageContext.Consumer>
        {storage => {
          if (storage.service) {
            const { service } = storage;
            return (
              <p>
                Invio per conto di {service.organization_name} /{" "}
                {service.service_name} [
                <a href={"/service/" + service.service_id}>
                  {service.service_id}
                </a>
                ]
              </p>
            );
          }

          return <Alert color="danger">Nessuna API key selezionata !</Alert>;
        }}
      </StorageContext.Consumer>
    );
  }
}
