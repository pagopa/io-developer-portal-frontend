import { Button } from "design-react-kit";
import e from "express";
import React, { ChangeEvent, Component, MouseEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import "./NewService.css";

type OwnProps = {
  t: (key: string) => string;
  show: boolean;
  serviceId: string;
  serviceName: string;
  organizationName: string;
  onClose: (event: MouseEvent) => void;
  onDisable: (event: MouseEvent) => void;
};

type Props = WithNamespaces & OwnProps;

class DisableService extends Component<Props> {
  public state: {
    show: boolean;
  } = {
    show: false
  };

  public componentDidMount() {
    this.setState({
      show: this.props.show
    });
  }
  private handlePublishReview(event: React.MouseEvent) {
    this.props.onDisable(event);
    this.props.onClose(event);
  }
  public render() {
    if (!this.state.show) {
      return null;
    }
    return (
      <div className="modal-card" onClick={this.props.onClose}>
        <div
          className="modal-content"
          onClick={event => event.stopPropagation()}
        >
          <div className="modal-header">
            <h4 className="modal-title">{this.props.t("deactive_service")}</h4>
          </div>
          <div className="modal-body">
            <p>{this.props.t("deactive_confirmation")}:</p>
            <ul>
              <li>ID: {this.props.serviceId}</li>
              <li>
                {this.props.t("service:title")}: {this.props.serviceName}
              </li>
              <li>
                {this.props.t("service:organization_name")}:{" "}
                {this.props.organizationName}
              </li>
            </ul>
            <p>{this.props.t("deactive_details")}</p>
          </div>
          <div className="modal-footer">
            <button onClick={this.props.onClose} className="btn">
              {this.props.t("cancel")}
            </button>
            <button
              onClick={event => {
                this.handlePublishReview(event);
              }}
              className="btn btn-primary"
            >
              {this.props.t("confirm")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
export default withNamespaces("modal")(DisableService);
