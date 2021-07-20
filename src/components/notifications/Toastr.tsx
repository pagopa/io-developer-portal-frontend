import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import successIcon from "../../assets/icon/check.svg";
import errorIcon from "../../assets/icon/error.svg";
import infoIcon from "../../assets/icon/info.svg";
import warningIcon from "../../assets/icon/warning.svg";
import "./Toastr.css";

const TIME_TO_SHOW = 5000;

export type ToastItem = {
  id: number;
  title: string;
  description: string;
  type: ToastType;
};

export enum ToastPosition {
  topRight = "top-right",
  bottomRight = "bottom-right"
}

export enum ToastType {
  success = "success",
  warning = "warning",
  error = "error",
  info = "info"
}

enum ToastBackground {
  success = "#5cb85c",
  warning = "#f0ad4e",
  error = "#d9534f",
  info = "#5bc0de"
}

type OwnProps = {
  toastMessage: ToastItem;
  position?: ToastPosition;
  delay?: number;
};
type Props = WithNamespaces & OwnProps;

class Toastr extends Component<Props> {
  public initialState = {
    position: ToastPosition.topRight,
    toastList: [],
    intervalId: undefined
  };

  public state = {
    toastList: [],
    position: this.props.position
      ? this.props.position
      : ToastPosition.topRight,
    intervalId: undefined
  };

  public constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  public componentDidMount() {
    this.setState({
      toastList: [...this.state.toastList, this.props.toastMessage]
    });
    const intervalId = setInterval(
      this.deleteToast,
      this.props.delay || TIME_TO_SHOW
    );
    this.setState({
      intervalId
    });
  }

  public componentDidUpdate(prevProps) {
    if (prevProps.toastMessage.id !== this.props.toastMessage.id) {
      this.setState({
        toastList: [...this.state.toastList, this.props.toastMessage]
      });
      clearInterval(this.state.intervalId);
      const intervalId = setInterval(
        this.deleteToast,
        this.props.delay || TIME_TO_SHOW
      );
      this.setState({
        intervalId
      });
    }
  }

  public componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  private deleteToast = () => {
    const [, ...rest] = this.state.toastList;
    this.setState({
      toastList: rest
    });
    if (this.state.toastList.length <= 0) {
      clearInterval(this.state.intervalId);
    }
  };

  private getBackgroundColor(type: ToastType) {
    switch (type) {
      case ToastType.error:
        return ToastBackground.error;
      case ToastType.info:
        return ToastBackground.info;
      case ToastType.success:
        return ToastBackground.success;
      case ToastType.warning:
        return ToastBackground.warning;
    }
  }

  private getIcon(type: ToastType) {
    switch (type) {
      case ToastType.error:
        return errorIcon;
      case ToastType.info:
        return infoIcon;
      case ToastType.success:
        return successIcon;
      case ToastType.warning:
        return warningIcon;
    }
  }

  public render() {
    const { toastList, position } = this.state;

    return (
      <>
        <div className={`notification-container ${position}`}>
          {toastList.map((toast, i) => (
            <div
              key={i}
              className={`notification toast ${position}`}
              style={{ backgroundColor: this.getBackgroundColor(toast.type) }}
            >
              <div className="notification-image">
                <img src={`${this.getIcon(toast.type)}`} alt="ICON" />
              </div>
              <div>
                <p className="notification-title">{toast.title}</p>
                <p className="notification-message">{toast.description}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

export default withNamespaces("notification")(Toastr);
