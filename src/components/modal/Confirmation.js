import React, { Component } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "design-react-kit";

class Confirmation extends Component {
  state = {
    isConfirmed: false
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      this.setState({ isConfirmed: false });
    }
  }

  render() {
    const { isConfirmed } = this.state;
    const { title, body, isOpen, onCancel, onConfirm } = this.props;

    return (
      <Modal isOpen={isOpen} toggle={onCancel}>
        <ModalHeader toggle={onCancel}>
          {title ? <p>{title}</p> : <p>Vuoi confermare l'operazione?</p>}
        </ModalHeader>
        <ModalBody>{body ? <p>{body}</p> : <p />}</ModalBody>
        <ModalFooter onClick={() => this.setState({ isConfirmed: true })}>
          <Button disabled={isConfirmed} color="secondary" onClick={onCancel}>
            Annulla
          </Button>
          <Button disabled={isConfirmed} color="primary" onClick={onConfirm}>
            Procedi
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default Confirmation;
