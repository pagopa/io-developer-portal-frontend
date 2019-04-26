import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

type NotificationState = {
  info: any;
};

type Props = {
  info: any;
  autoClose?: any;
};
type NotificationProps = WithNamespaces & Props;

class Notification extends Component<NotificationProps, NotificationState> {
  public initialState: NotificationState = {
    info: {}
  };

  public state: NotificationState = {
    info: this.props.info
  };

  public static getDerivedStateFromProps(props: any, state: NotificationState) {
    if (state.info._id && state.info._id !== props.info._id) {
      return {
        info: props.info
      };
    }
    return null;
  }

  public componentDidMount() {
    const { state, props, autoClose } = this;
    if (props.autoClose && state.info._id) {
      autoClose();
    }
  }

  public autoClose = () => {
    setTimeout(() => {
      this.close();
    }, 1 * 5000);
  };

  public close = () => {
    this.setState({
      info: this.initialState.info
    });
  };

  public render() {
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
