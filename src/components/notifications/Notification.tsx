import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";
import {
  isProblemJson,
  MessagePostAndPersistResult
} from "../../utils/operations";

type NotificationState = {
  info?: MessagePostAndPersistResult;
};

type OwnProps = {
  info: MessagePostAndPersistResult;
  autoClose?: boolean;
};
type Props = WithNamespaces & OwnProps;

class Notification extends Component<Props, NotificationState> {
  public initialState: NotificationState = {
    info: undefined
  };

  public state: NotificationState = {
    info: this.props.info
  };

  public static getDerivedStateFromProps(
    props: Props,
    state: NotificationState
  ) {
    if (state.info && state.info._id && state.info._id !== props.info._id) {
      return {
        info: props.info
      };
    }
    return null;
  }

  public componentDidMount() {
    const { state, props, autoClose } = this;
    if (props.autoClose && state.info && state.info._id) {
      autoClose();
    }
  }

  public autoClose = () => {
    setTimeout(() => {
      this.close();
    }, 5000);
  };

  public close = () => {
    this.setState({
      info: this.initialState.info
    });
  };

  public render() {
    const { info } = this.state;
    const { t } = this.props;

    if (
      !info ||
      !isProblemJson(info.message) ||
      (info.message.status !== undefined && info.message.status < 400)
    ) {
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
