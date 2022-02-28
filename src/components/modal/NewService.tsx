import { Button } from "design-react-kit";
import React, { ChangeEvent, Component, MouseEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import "./Modal.css";

type OwnProps = {
  t: (key: string) => string;
  show: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAdd: (event: MouseEvent) => void;
  onClose: (event: MouseEvent) => void;
  serviceName: string;
  departmentName: string;
  organizationName: string;
  organization_fiscal_code: string;
};

type Props = WithNamespaces & OwnProps;

class NewService extends Component<Props> {
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
            <h4 className="modal-title">{this.props.t("new_service")}</h4>
          </div>
          <div className="modal-body">
            <div className="p-4 mt-1">
              <label>{this.props.t("service:name")}</label>
              <input
                name="service_name"
                type="text"
                defaultValue={this.props.serviceName}
                onChange={this.props.onChange}
              />
              <label>{this.props.t("service:department")}</label>
              <input
                name="department_name"
                type="text"
                defaultValue={this.props.departmentName}
                onChange={this.props.onChange}
              />
              <label>{this.props.t("service:organization")}</label>
              <input
                name="organization_name"
                defaultValue={this.props.organizationName}
                type="text"
                onChange={this.props.onChange}
              />
              <label>{this.props.t("service:organization_fiscal_code")}</label>
              <input
                name="organization_fiscal_code"
                type="text"
                defaultValue={this.props.organization_fiscal_code}
                onChange={this.props.onChange}
              />

              <Button
                className="mt-3"
                color="primary"
                onClick={e => {
                  this.props.onClose(e);
                  this.props.onAdd(e);
                }}
              >
                {this.props.t("add_subscription")}
              </Button>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.props.onClose} className="btn btn-primary">
              {this.props.t("close")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
export default withNamespaces("modal")(NewService);
