import { Button } from "design-react-kit";
import React, { Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Link } from "react-router-dom";
import { Collapse } from "reactstrap";

import FaAngleDown from "react-icons/lib/fa/angle-down";
import FaAngleUp from "react-icons/lib/fa/angle-up";
import FaEye from "react-icons/lib/fa/eye";
import FaEyeSlash from "react-icons/lib/fa/eye-slash";

import { SubscriptionContract } from "../../../generated/definitions/backend/SubscriptionContract";
import { Service } from "../../../generated/definitions/commons/Service";
import { getColorClass, getText, ServiceStatus } from "../../utils/service";
import ToggleServiceInfo from "./ToggleServiceInfo";

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
  keyDisplay: {
    [x: string]: undefined | boolean;
  };
  isSecondaryKeyCollapsed: boolean;
};

class ServiceCard extends Component<Props, ServiceCardState> {
  public state: ServiceCardState = {
    showMoreInfo: false,
    keyDisplay: {},
    isSecondaryKeyCollapsed: true
  };

  private onToggleKey(keyIdx: string) {
    this.setState(prevState => ({
      keyDisplay: {
        ...prevState.keyDisplay,
        [keyIdx]: !prevState.keyDisplay[keyIdx]
      }
    }));
  }

  private onSetKey = (serviceKey: string, service: Service) => () => {
    sessionStorage.setItem("serviceKey", serviceKey);
    sessionStorage.setItem("service", JSON.stringify(service));
    window.location.replace("/compose");
  };

  private onRegenerateKey = (
    keyType: string,
    subscriptionId?: string
  ) => async () => {
    if (subscriptionId) {
      return this.props.onRegenerateKey(keyType, subscriptionId);
    }
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

  private getServiceApiKeys = ({ subscription, service, t }: Props) => (
    <div className="card-service-key px-4 py-3">
      <div className="row">
        <div className="col-auto m-auto">
          <span className="service-card--key-label d-inline-block">
            {t("primary_key")}:{" "}
          </span>
          {this.state.keyDisplay[`p_${subscription.name}`]
            ? subscription.primaryKey
            : t("key")}
        </div>
        <div className="col">
          <Button
            outline={true}
            color="primary"
            size="xs"
            className="ml-1 mr-1"
            onClick={() => this.onToggleKey(`p_${subscription.name}`)}
          >
            {this.state.keyDisplay[`p_${subscription.name}`] ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </Button>
          <Button
            color="primary"
            size="xs"
            className="mr-1"
            outline={true}
            disabled={!service || subscription.state !== "active"}
            onClick={this.onRegenerateKey("primary", subscription.name)}
          >
            {t("regenerate")}
          </Button>
          <Button
            color="primary"
            size="xs"
            className="mr-1"
            disabled={!service || subscription.state !== "active"}
            onClick={this.onSetKey(subscription.primaryKey, service)}
          >
            {t("use")}
          </Button>
        </div>
        <div className="col-auto text-right">
          <Button
            className="py-0"
            color="link"
            onClick={this.toggleSecondaryKey}
            aria-expanded={this.state.isSecondaryKeyCollapsed}
          >
            {this.state.isSecondaryKeyCollapsed ? (
              <FaAngleDown size="2em" />
            ) : (
              <FaAngleUp size="2em" />
            )}
          </Button>
        </div>
      </div>
      <Collapse isOpen={!this.state.isSecondaryKeyCollapsed}>
        <div className="row mt-2">
          <div className="col-auto m-auto">
            <span className="service-card--key-label d-inline-block">
              {t("secondary_key")}:{" "}
            </span>
            {this.state.keyDisplay[`s_${subscription.name}`]
              ? subscription.secondaryKey
              : t("key")}
          </div>
          <div className="col">
            <Button
              outline={true}
              color="primary"
              size="xs"
              className="ml-1 mr-1"
              onClick={() => this.onToggleKey(`s_${subscription.name}`)}
            >
              {this.state.keyDisplay[`s_${subscription.name}`] ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </Button>
            <Button
              color="primary"
              size="xs"
              className="mr-1"
              outline={true}
              disabled={!service || subscription.state !== "active"}
              onClick={this.onRegenerateKey("secondary", subscription.name)}
            >
              {t("regenerate")}
            </Button>

            <Button
              color="primary"
              size="xs"
              className="mr-1"
              disabled={!service || subscription.state !== "active"}
              onClick={this.onSetKey(subscription.secondaryKey, service)}
            >
              {t("use")}
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  );

  private toggleSecondaryKey = () => {
    this.setState({
      isSecondaryKeyCollapsed: !this.state.isSecondaryKeyCollapsed
    });
  };

  public render() {
    const { subscription, service } = this.props;

    return service ? (
      <Fragment>
        <div className="card-service my-4" key={subscription.id}>
          {this.getServiceBody(this.props)}
          {this.getServiceApiKeys(this.props)}
        </div>
      </Fragment>
    ) : null;
  }
}

export default withNamespaces("profile")(ServiceCard);
