import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

import { StorageContext } from "../context/storage";

class Service extends Component<WithNamespaces, never> {
  public render() {
    const { t } = this.props;

    return (
      <StorageContext.Consumer>
        {storage => {
          if (storage.service) {
            const { service } = storage;
            return (
              <p>
                {t("send_as")} {service.organization_name} /{" "}
                {service.service_name} [
                <a href={"/service/" + service.service_id}>
                  {service.service_id}
                </a>
                ]
              </p>
            );
          }

          return <Alert color="danger">{t("no_services")}</Alert>;
        }}
      </StorageContext.Consumer>
    );
  }
}

export default withNamespaces("service")(Service);
