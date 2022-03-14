import { fromNullable } from "fp-ts/lib/Option";
import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import {
  FaCheck,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfo
} from "react-icons/lib/fa";
import "./Toastr.css";

const TIME_TO_SHOW = 5000;

export type ToastrItem = {
  id: number;
  title: string;
  description: string;
  type: ToastrType;
};

export enum ToastrPosition {
  topRight = "top-right",
  bottomRight = "bottom-right"
}

export enum ToastrType {
  success = "success",
  warning = "warning",
  error = "error",
  info = "info"
}

enum ToastrBackground {
  success = "#5cb85c",
  warning = "#f0ad4e",
  error = "#d9534f",
  info = "#5bc0de"
}

type OwnProps = {
  t: (key: string) => string;
  toastMessage: ToastrItem;
  position?: ToastrPosition;
  delay?: number;
  onToastrClose: (event: ToastrItem) => void;
  onErrorDetail?: () => void;
};
type Props = WithNamespaces & OwnProps;

type ToastrState = {
  intervalId?: NodeJS.Timeout;
  position: ToastrPosition;
  toastList: ReadonlyArray<ToastrItem>;
};

class Toastr extends Component<Props, ToastrState> {
  public initialState: ToastrState = {
    position: ToastrPosition.topRight,
    toastList: [],
    intervalId: undefined
  };

  public state: ToastrState = {
    toastList: [],
    position: this.props.position
      ? this.props.position
      : ToastrPosition.topRight,
    intervalId: undefined
  };

  public constructor(props: Props) {
    super(props);
    this.state = this.initialState;
  }

  public componentDidMount() {
    this.setState({
      toastList: [...this.state.toastList, this.props.toastMessage]
    });
    const intervalId = setInterval(
      this.deleteToast,
      fromNullable(this.props.delay).getOrElse(TIME_TO_SHOW)
    );
    this.setState({
      intervalId
    });
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.toastMessage.id !== this.props.toastMessage.id) {
      this.setState({
        toastList: [...this.state.toastList, this.props.toastMessage]
      });
      // tslint:disable-next-line: no-unused-expression
      this.state.intervalId && clearInterval(this.state.intervalId);
      const intervalId = setInterval(
        this.deleteToast,
        fromNullable(this.props.delay).getOrElse(TIME_TO_SHOW)
      );
      this.setState({
        intervalId
      });
    }
  }

  public componentWillUnmount() {
    // tslint:disable-next-line: no-unused-expression
    this.state.intervalId && clearInterval(this.state.intervalId);
  }

  private deleteToast = () => {
    const [deletedToast, ...rest] = this.state.toastList;
    this.setState({
      toastList: rest
    });
    if (this.state.toastList.length <= 0 && this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.props.onToastrClose(deletedToast);
    }
  };

  private getBackgroundColor(type: ToastrType) {
    switch (type) {
      case ToastrType.error:
        return ToastrBackground.error;
      case ToastrType.info:
        return ToastrBackground.info;
      case ToastrType.success:
        return ToastrBackground.success;
      case ToastrType.warning:
        return ToastrBackground.warning;
    }
  }

  private getIcon(type: ToastrType) {
    switch (type) {
      case ToastrType.error:
        return <FaExclamationCircle />;
      case ToastrType.info:
        return <FaInfo />;
      case ToastrType.success:
        return <FaCheck />;
      case ToastrType.warning:
        return <FaExclamationTriangle />;
    }
  }

  public render() {
    const { toastList, position } = this.state;
    const { onErrorDetail } = this.props;
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
                {this.getIcon(toast.type)}
              </div>
              <div>
                <p className="notification-title">{toast.title}</p>
                <p className="notification-message">{toast.description}</p>
                {toast.type === ToastrType.error &&
                  typeof onErrorDetail === "function" && (
                    <p
                      className="notification-errors-detail"
                      onClick={() => onErrorDetail()}
                    >
                      {this.props.t("list_errors")}
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

export default withNamespaces("toasterMessage")(Toastr);
