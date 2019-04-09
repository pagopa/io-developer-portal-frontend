import React, { Component } from "react";

import { withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

type NotificationState = {
  info: any
};

class Notification extends Component<any, NotificationState> {
  initialState = {
    info: {}
  };

  state = {
    info: this.props.info
  };

  static getDerivedStateFromProps(props, state) {
    if (state.info._id && state.info._id !== props.info._id) {
      return {
        info: props.info
      };
    }
    return null;
  }

  componentDidMount() {
    const { state, props, autoClose } = this;
    if (props.autoClose && state.info._id) {
      autoClose();
    }
  }

  autoClose = () => {
    setTimeout(() => {
      this.close();
    }, 1 * 5000);
  };

  close = () => {
    this.setState({
      info: this.initialState.info
    });
  };

  render() {
    const { info } = this.state;
    const { t } = this.props;

    if (!info.message || !info.message.status || info.message.status < 400) {
      return null;
    }

    return (
      <div className="bg-white">
        <Alert isOpen={!!info._id} toggle={this.close} color="danger">
          {(() => {
            return (
              <div>
                <h4 className="alert-heading text-truncate">
                  {info.message.title} ({info.message.status})
                </h4>
                <span className="text-word-break">{info.message.detail}</span>
                <hr />
                {t("recipient")}: {info.message.fiscal_code}
              </div>
            );
          })()}
        </Alert>
      </div>
    );
  }
}

export default withNamespaces("notification")(Notification);
