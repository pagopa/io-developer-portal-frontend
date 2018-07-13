import React, { Component } from "react";

import {
  Col,
  Row,
  Card,
  Form,
  InputGroup,
  InputGroupAddon,
  Input,
  ListGroup,
  ListGroupItem
} from "design-react-kit";

import AsyncStorage from "@callstack/async-storage";

import { get } from "../api";

const getUserIcon = ({ sender_allowed, status }) => {
  if (sender_allowed === true) {
    return "it-check";
  } else if (sender_allowed === false) {
    return "it-no";
  }

  return "it-error";
};

class Home extends Component {
  initialState = {
    code: "",
    contacts: {}
  };

  state = {
    code: this.initialState.code,
    contacts: this.initialState.contacts
  };

  componentWillMount() {
    AsyncStorage.getItem("contacts").then(contacts => {
      if (contacts) {
        this.setState(() => ({
          contacts: JSON.parse(contacts)
        }));
      }
    });
  }

  onInputCode = ({ target: { value } }) => {
    this.setState({
      code: value
    });
  };

  onInputAdd = () => {
    let { code } = this.state;
    code = code.toUpperCase();

    if (!code) {
      return;
    }

    this.setState(
      {
        code: this.initialState.code
      },
      async () => {
        let profile = await get({ path: `profiles/${code}` });

        if (profile.status) {
          // The API returns errors with shape { detail, status, title }
          profile = { sender_allowed: null, status: profile.status };
        }

        const contacts =
          JSON.parse(await AsyncStorage.getItem("contacts")) || {};

        contacts[code] = profile;

        await AsyncStorage.setItem("contacts", JSON.stringify(contacts));
        this.setState(() => ({
          contacts
        }));
      }
    );
  };

  render() {
    const { code, contacts } = this.state;

    return (
      <section className="container home--container mt-5">
        <Card className="border border-primary rounded p-3">
          <Row>
            <Col lg="4">
              <h1 className="display-4 text-center">Rubrica</h1>

              <InputGroup className="pb-3">
                <Input
                  className="border-0"
                  placeholder="Codice Fiscale"
                  aria-label="Codice Fiscale"
                  value={code}
                  onChange={this.onInputCode}
                />
                <InputGroupAddon addonType="append" onClick={this.onInputAdd}>
                  <span className="border-0 input-group-text it-close icon-rotate-45deg cursor-pointer" />
                </InputGroupAddon>
              </InputGroup>

              <ListGroup>
                {(() => {
                  return Object.keys(contacts).map(key => {
                    const contact = contacts[key];

                    return (
                      <ListGroupItem key={key}>
                        <div className="d-flex w-100 justify-content-between">
                          <div>{key}</div>
                          <div>
                            <i className={`${getUserIcon(contact)}`} />
                          </div>
                        </div>
                      </ListGroupItem>
                    );
                  });
                })()}
              </ListGroup>
            </Col>
            <Col lg="8" />
          </Row>
        </Card>
      </section>
    );
  }
}

export default Home;
