import React, { Component } from "react";

import {
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  InputGroup,
  InputGroupAddon,
  Input,
  Label
} from "design-react-kit";

import Trash from "react-icons/lib/fa/trash";

class ServerPicker extends Component<any, any> {
  render() {
    const {
      server,
      value,
      checked,
      disabled,
      onServerSelect,
      onServerChange,
      onServerDelete
    } = this.props;

    return (
      <Row>
        <Col lg="1" className="d-flex align-items-center">
          <Input
            type="radio"
            checked={checked}
            name="server"
            className="shadow-none"
            onChange={() => onServerSelect(server)}
          />
        </Col>
        <Col>
          <InputGroup size="sm">
            <Input
              type="text"
              value={value}
              disabled={disabled}
              onChange={({ target: { value } }) =>
                onServerChange(server, value)
              }
            />
            {onServerDelete && (
              <InputGroupAddon
                addonType="append"
                onClick={() => onServerDelete(server)}
              >
                <span className="input-group-text cursor-pointer"><Trash /></span>
              </InputGroupAddon>
            )}
          </InputGroup>
        </Col>
      </Row>
    );
  }
}

export default ServerPicker;
