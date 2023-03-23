import { Button } from "design-react-kit";
import React, { Component, MouseEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import "./Modal.css";

const CIDRS_REGEX = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}(;(\d{1,3}\.){3}\d{1,3}\/\d{1,2})*$/;

type OwnProps = {
  t: (key: string) => string;
  show: boolean;
  value: readonly string[];
  onSubmit: (value: readonly string[]) => void;
  onClose: (event: MouseEvent) => void;
};

type Props = WithNamespaces & OwnProps;

type EditCIDRsState = {
  show: boolean;
  value: string;
  isValid: boolean;
  isSameInitialValue: boolean;
};

class EditCIDRs extends Component<Props> {
  public state: EditCIDRsState = {
    show: false,
    value: "",
    isValid: false,
    isSameInitialValue: true
  };

  public componentDidMount() {
    this.setState({
      show: this.props.show
    });
    this.handleInputChange(this.props.value.join(";"));
  }

  public handleInputChange = (input: string) => {
    const cidrs = input.split(";");
    this.setState({
      value: input,
      isValid: cidrs.filter(cidr => !CIDRS_REGEX.test(cidr)).length === 0,
      isSameInitialValue:
        this.props.value.length === cidrs.length &&
        this.props.value.every((value, index) => value === cidrs[index])
    });
  };

  public handleSubmit = () => {
    const uniqueValues = this.state.value
      .split(";")
      .filter((value, index, self) => self.indexOf(value) === index);
    this.props.onSubmit(uniqueValues);
  };

  public render() {
    const { value, isValid, isSameInitialValue } = this.state;

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
            <h4 className="modal-title">{this.props.t("edit_cidrs")}</h4>
          </div>
          <div className="modal-body">
            <div className="p-4 mt-1">
              <label>{this.props.t("service:example_authorized_ips")}</label>
              <textarea
                value={value}
                onChange={e => this.handleInputChange(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  borderColor: isValid ? "inherit" : "red",
                  color: isValid ? "inherit" : "red"
                }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button
              color="primary"
              outline={true}
              onClick={e => {
                this.props.onClose(e);
              }}
            >
              {this.props.t("close")}
            </Button>
            <Button
              className="ml-1"
              color="primary"
              disabled={!isValid || isSameInitialValue}
              onClick={e => {
                this.handleSubmit();
                this.props.onClose(e);
              }}
            >
              {this.props.t("edit")}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
export default withNamespaces("modal")(EditCIDRs);
