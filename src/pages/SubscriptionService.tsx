import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Button } from "design-react-kit";

import { RouteComponentProps } from "react-router";
import { StorageContext } from "../context/storage";
import { getFromBackend, putToBackend } from "../utils/backend";

import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";

type OwnProps = {};
type Props = RouteComponentProps<{ service_id: string }> &
  WithNamespaces &
  OwnProps;

type SubscriptionServiceState = {
  service?: Service;
};

function inputValueMap(name: string, value: string | boolean) {
  switch (name) {
    case "max_allowed_payment_amount":
      return Number(value);

    case "authorized_cidrs":
    case "authorized_recipients": {
      if (typeof value === "string") {
        return value.split(";");
      }
      return [];
    }

    default:
      return value;
  }
}

class SubscriptionService extends Component<Props, SubscriptionServiceState> {
  public state: SubscriptionServiceState = {
    service: undefined
  };

  public async componentDidMount() {
    const serviceId = this.props.match.params.service_id;
    const service = await getFromBackend<Service>({
      path: `services/${serviceId}`
    });
    this.setState({
      service
    });
  }

  public handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    const serviceDecoding = Service.decode({
      ...this.state.service,
      [name]: inputValueMap(name, value)
    });
    if (serviceDecoding.isRight()) {
      this.setState({
        service: serviceDecoding.value
      });
    }
  };

  public handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    const serviceDecoding = Service.decode({
      ...this.state.service,
      [name]: inputValueMap(name, value)
    });
    if (serviceDecoding.isRight()) {
      this.setState({
        service: serviceDecoding.value
      });
    }
  };

  public handleSubmit = async () => {
    const serviceDecoding = Service.decode(this.state.service);
    if (serviceDecoding.isLeft()) {
      // TODO: handle error
      throw new Error("Wrong parameters format");
    }
    const service = serviceDecoding.value;
    await putToBackend({
      path: `services/${service.service_id}`,
      options: {
        // limit fields to editable ones
        body: JSON.stringify({
          organization_fiscal_code: service.organization_fiscal_code,
          organization_name: service.organization_name,
          department_name: service.department_name,
          service_name: service.service_name,
          max_allowed_payment_amount: service.max_allowed_payment_amount,
          authorized_cidrs: service.authorized_cidrs,
          authorized_recipients: service.authorized_recipients,
          is_visible: service.is_visible,
          description: service.service_metadata
            ? service.service_metadata.description
            : undefined,
          web_url: service.service_metadata
            ? service.service_metadata.web_url
            : undefined,
          app_ios: service.service_metadata
            ? service.service_metadata.app_ios
            : undefined,
          app_android: service.service_metadata
            ? service.service_metadata.app_android
            : undefined,
          tos_url: service.service_metadata
            ? service.service_metadata.tos_url
            : undefined,
          privacy_url: service.service_metadata
            ? service.service_metadata.privacy_url
            : undefined,
          address: service.service_metadata
            ? service.service_metadata.address
            : undefined,
          phone: service.service_metadata
            ? service.service_metadata.phone
            : undefined,
          email: service.service_metadata
            ? service.service_metadata.email
            : undefined,
          pec: service.service_metadata
            ? service.service_metadata.pec
            : undefined,
          cta: service.service_metadata
            ? service.service_metadata.cta
            : undefined,
          token_name: service.service_metadata
            ? service.service_metadata.token_name
            : undefined,
          support_url: service.service_metadata
            ? service.service_metadata.support_url
            : undefined,
          scope: service.service_metadata
            ? service.service_metadata.scope
            : undefined
        })
      }
    });
  };

  public render() {
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
                    defaultValue={
                      service.max_allowed_payment_amount
                        ? service.max_allowed_payment_amount.toString()
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("authorized_ips")}</label>
                  <input
                    name="authorized_cidrs"
                    type="text"
                    defaultValue={service.authorized_cidrs.join(";")}
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("authorized_recipients")}</label>
                  <input
                    name="authorized_recipients"
                    type="text"
                    defaultValue={service.authorized_recipients.join(";")}
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("description")}</label>
                  <input
                    name="description"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.description
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("web_url")}</label>
                  <input
                    name="web_url"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.web_url
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("app_ios")}</label>
                  <input
                    name="app_ios"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.app_ios
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("app_android")}</label>
                  <input
                    name="app_android"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.app_android
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("tos_url")}</label>
                  <input
                    name="tos_url"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.tos_url
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("privacy_url")}</label>
                  <input
                    name="privacy_url"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.privacy_url
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("address")}</label>
                  <input
                    name="address"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.address
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("phone")}</label>
                  <input
                    name="phone"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.phone
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("email")}</label>
                  <input
                    name="email"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.email
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("pec")}</label>
                  <input
                    name="pec"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.pec
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("cta")}</label>
                  <input
                    name="cta"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.cta
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("token_name")}</label>
                  <input
                    name="token_name"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.token_name
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("support_url")}</label>
                  <input
                    name="support_url"
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.support_url
                        : undefined
                    }
                    onChange={this.handleInputChange}
                    className="mb-4"
                  />
                </div>
              )}

              {storage.isApiAdmin && (
                <div>
                  <label className="m-0">{t("scope")} </label>
                  <select
                    name="scope"
                    value={
                      service.service_metadata
                        ? service.service_metadata.scope
                        : undefined
                    }
                    onChange={this.handleSelectChange}
                    className="mb-4"
                  >
                    <option
                      aria-selected="true"
                      key={ServiceScopeEnum.NATIONAL}
                      value={ServiceScopeEnum.NATIONAL}
                    >
                      {ServiceScopeEnum.NATIONAL}
                    </option>
                    <option
                      aria-selected="true"
                      key={ServiceScopeEnum.LOCAL}
                      value={ServiceScopeEnum.LOCAL}
                    >
                      {ServiceScopeEnum.LOCAL}
                    </option>
                  </select>
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
                </div>
              )}

              <Button color="primary" onClick={this.handleSubmit}>
                {t("save")}
              </Button>
            </form>

            {service.authorized_recipients.length > 0 && (
              <div className="mb-3">
                {t("authorized_recipients")}:{" "}
                {service.authorized_recipients.join(";")}
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
