import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "design-react-kit";

type OwnProps = {
  title?: string;
  body?: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
type Props = WithNamespaces & OwnProps;

type ConfirmationState = {
  isConfirmed: boolean;
};

class Confirmation extends Component<Props, ConfirmationState> {
  public state: ConfirmationState = {
    isConfirmed: false
  };

  public componentDidUpdate(prevProps: Props) {
    if (this.props.isOpen !== prevProps.isOpen) {
      this.setState({ isConfirmed: false });
    }
  }

  public render() {
    const { isConfirmed } = this.state;
    const { title, body, isOpen, onCancel, onConfirm } = this.props;
    const { t } = this.props;

    return (
      <Modal isOpen={isOpen} toggle={onCancel}>
        <ModalHeader toggle={onCancel}>
          {title ? <p>{title}</p> : <p>{t("confirm_operation")}</p>}
        </ModalHeader>
        <ModalBody>{body ? <p>{body}</p> : <p />}</ModalBody>
        <ModalFooter onClick={() => this.setState({ isConfirmed: true })}>
          <Button disabled={isConfirmed} color="secondary" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button disabled={isConfirmed} color="primary" onClick={onConfirm}>
            {t("proceed")}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default withNamespaces("confirmation")(Confirmation);
