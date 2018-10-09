import React, { Component } from "react";

import { Alert } from "design-react-kit";

class Notification extends Component {
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
                Destinatario: {info.message.fiscal_code}
              </div>
            );
          })()}
        </Alert>
      </div>
    );
  }
}

export default Notification;
