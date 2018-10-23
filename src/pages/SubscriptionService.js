import React, { Component } from "react";

import { withNamespaces } from "react-i18next";

import { Button } from "design-react-kit";

import { getFromBackend, putToBackend } from "../utils/backend";
import { StorageContext } from "../context/storage";

class SubscriptionService extends Component {
  state = {};

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
          service_name: service.service_name,
          max_allowed_payment_amount: parseInt(service.max_allowed_payment_amount),
          is_visible: new Boolean(service.is_visible)
        }
      }
    });
  };

  render() {
    const service = this.state.service;
    const { t } = this.props;

    return service ? (
      <StorageContext.Consumer>
        {storage => (
          <div>
            <h4>
              {t("title")} {service.service_id}
            </h4>
            <form className="mb-5 mt-1">
              <label className="m-0">{t("name")}</label>
              <input
                name="service_name"
                type="text"
                defaultValue={service.service_name}
                onChange={this.handleInputChange}
                className="mb-4"
              />

              <label className="m-0">{t("department")}</label>
              <input
                name="department_name"
                type="text"
                defaultValue={service.department_name}
                onChange={this.handleInputChange}
                className="mb-4"
              />

              <label className="m-0">{t("organization")}</label>
              <input
                name="organization_name"
                type="text"
                defaultValue={service.organization_name}
                onChange={this.handleInputChange}
                className="mb-4"
              />

              <label className="m-0">{t("organization_fiscal_code")}</label>
              <input
                name="organization_fiscal_code"
                type="text"
                defaultValue={service.organization_fiscal_code}
                onChange={this.handleInputChange}
                className="mb-4"
              />

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">
                    {t("max_allowed_payment_amount")}
                  </label>
                  <input
                    name="max_allowed_payment_amount"
                    type="text"
                    defaultValue={service.max_allowed_payment_amount}
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <input
                    name="is_visible"
                    type="checkbox"
                    defaultChecked={service.is_visible}
                    onChange={this.handleInputChange}
                    className="mb-4 mr-2"
                  />
                  <label className="m-0">{t("visible_service")}</label>
                </div>)}

              <Button color="primary" onClick={this.handleSubmit}>
                {t("save")}
              </Button>
            </form>

            {service.authorized_recipients.length > 0 && (
              <div className="mb-3">
                {t("authorized_recipients")}: {service.authorized_recipients}
              </div>
            )}

            {service.authorized_cidrs.length > 0 && (
              <div className="mb-3">
                {t("authorized_ips")}: {service.authorized_cidrs}
              </div>
            )}

            {!storage.isApiAdmin && (
              <div className="mb-3">
                {t("max_allowed_payment_amount")}:{" "}
                {service.max_allowed_payment_amount} {t("eurocents")}
              </div>
            )}
          </div>
        )}
      </StorageContext.Consumer>
    ) : null;
  }
}

export default withNamespaces("service")(SubscriptionService);
