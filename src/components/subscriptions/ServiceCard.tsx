import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Link } from "react-router-dom";

import { SubscriptionContract } from "../../../generated/definitions/backend/SubscriptionContract";
import { Service } from "../../../generated/definitions/commons/Service";
import { getColorClass, getText, ServiceStatus } from "../../utils/service";
import ToggleServiceInfo from "./ToggleServiceInfo";

import ApiKey from "./ApiKey";
import "./ServiceCard.css";

type OwnProps = {
  subscription: SubscriptionContract;
  service: Service;
  status: string;
  onRegenerateKey: (keyType: string, subscriptionId: string) => void;
};
type Props = WithNamespaces & OwnProps;

type ServiceCardState = {
  showMoreInfo: boolean;
  collapseSecondaryKey: boolean;
  maskedKeys: {
    primary: boolean;
    secondary: boolean;
  };
};

class ServiceCard extends Component<Props, ServiceCardState> {
  public state: ServiceCardState = {
    showMoreInfo: false,
    collapseSecondaryKey: true,
    maskedKeys: { primary: true, secondary: true }
  };

  private getServiceBody = ({ service, status, t }: Props) => (
    <div className="p-4">
      <div className="row">
        <div className="col-8">
          <h5>
            <span className="light-text">{t("service:title")}:</span>{" "}
            <span className="dark-text">{service.service_id}</span>
          </h5>
        </div>
        <div className="col">
          <div className="col text-right">
            <h5>
              <span
                className={`badge badge-pill ${getColorClass(
                  status as ServiceStatus,
                  "badge"
                )}`}
              >
                {t(getText(status as ServiceStatus))}
              </span>
            </h5>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <span className="light-text">{t("service:name")}:</span>{" "}
        <span className="dark-text">{service.service_name}</span>
      </div>
      <div className="my-1">
        <span className="light-text">{t("service:organization")}:</span>{" "}
        <span className="dark-text">{service.organization_name}</span>
      </div>
      <div className="row">
        <div className="col-9">
          <div className={this.state.showMoreInfo ? "d-block" : "d-none"}>
            <div className="my-1">
              <span className="light-text">
                {t("service:authorized_recipients")}:
              </span>{" "}
              <span className="dark-text">
                {service.authorized_recipients.map((value, index, list) =>
                  index < list.length - 1 ? `${value}, ` : value
                )}
              </span>
            </div>
            <div className="my-1">
              <span className="light-text">{t("service:authorized_ips")}:</span>{" "}
              <span className="dark-text">
                {service.authorized_cidrs.map((value, index, list) =>
                  index < list.length - 1 ? `${value}, ` : value
                )}
              </span>
            </div>
            <div className="my-1">
              <span className="light-text">
                {t("service:max_allowed_payment_amount")}:
              </span>{" "}
              <span className="dark-text">
                {service.max_allowed_payment_amount} {t("service:eurocents")}
              </span>
            </div>
          </div>
          <ToggleServiceInfo
            showMore={this.state.showMoreInfo}
            onClick={() => {
              this.setState({ showMoreInfo: !this.state.showMoreInfo });
            }}
          />
        </div>
        <div className="col text-right">
          <Link
            className="btn btn-primary"
            to={{
              pathname: `/service/${service.service_id}`,
              state: {
                isVisible: !!service.is_visible
              }
            }}
          >
            {t("service:edit")}
          </Link>
        </div>
      </div>
    </div>
  );

  public render() {
    const { subscription, service } = this.props;
    const { collapseSecondaryKey, maskedKeys } = this.state;

    const toggleSecondaryKey = (value: boolean) => {
      this.setState({
        collapseSecondaryKey: value
      });
    };

    const maskChange = (key: "primary" | "secondary", masked: boolean) => {
      this.setState({
        maskedKeys: { ...maskedKeys, [key]: masked }
      });
    };

    return service ? (
      <div className="card-service my-4" key={subscription.id}>
        {this.getServiceBody(this.props)}
        <ApiKey
          subscription={subscription}
          service={service}
          showUseKeyAction={true}
          collapseSecondaryKey={collapseSecondaryKey}
          maskedKeys={maskedKeys}
          additionalClass="px-4 py-3"
          additionalStyle={{ borderRadius: "0px 0px 10px 10px" }}
          onRegenerateKey={(keyType, subscriptionId) =>
            this.props.onRegenerateKey(keyType, subscriptionId)
          }
          onCollapseChange={toggleSecondaryKey}
          onMaskChange={maskChange}
        />
      </div>
    ) : null;
  }
}

export default withNamespaces("profile")(ServiceCard);
