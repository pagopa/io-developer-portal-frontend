import React, { Component, MouseEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import "../modal/Modal.css";

type OwnProps = {
  t: (key: string) => string;
  show: boolean;
  onClose: (event: MouseEvent) => void;
};

type Props = WithNamespaces & OwnProps;

class MigrationsPanel extends Component<Props> {
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
    const { t } = this.props;
    return (
      <div className="modal-card" onClick={this.props.onClose}>
        <div
          className="modal-content"
          onClick={event => event.stopPropagation()}
        >
          <div className="modal-header">
            <h4 className="modal-title">{t("migrations_panel_title")}</h4>
          </div>
          <div className="modal-body">
            <div>
              <span>{t("migrations_panel_list_empty")}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.props.onClose} className="btn btn-primary">
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
export default withNamespaces(["subscription_migrations", "modal"])(
  MigrationsPanel
);
