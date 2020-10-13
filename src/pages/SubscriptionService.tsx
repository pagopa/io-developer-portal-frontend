import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Button } from "design-react-kit";

import { RouteComponentProps } from "react-router";
import { StorageContext } from "../context/storage";
import { getFromBackend, putToBackend } from "../utils/backend";

import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import MetadataInput from "../components/input/MetadataInput";

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
          service_metadata: service.service_metadata
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

              <MetadataInput
                onChangeText={this.handleInputChange}
                onChangeSelect={this.handleSelectChange}
                service={service}
                isApiAdmin={storage.isApiAdmin}
              />

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
