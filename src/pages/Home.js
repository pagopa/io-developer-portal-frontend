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
  ListGroupItem,
  FormGroup,
  Label,
  Button
} from "design-react-kit";

import ReactMarkdown from "react-markdown";

import AsyncStorage from "@callstack/async-storage";

import { get, post } from "../api";

import "./Home.css";

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
    subject: "",
    message: "",
    selected: "",
    contacts: {}
  };

  state = {
    code: this.initialState.code,
    subject: this.initialState.message,
    message: this.initialState.message,
    selected: this.initialState.selected,
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

  onContactSelect = code => {
    this.setState((prevState, props) => {
      const contacts = prevState.contacts;

      if (contacts[code].sender_allowed) {
        Object.keys(contacts).map(key => {
          contacts[key].active = false;
        });
        contacts[code].active = true;
      }

      return {
        contacts,
        selected: code
      };
    });
  };

  onChangeSubject = ({ target: { value } }) => {
    this.setState({
      subject: value
    });
  };

  onChangeMessage = ({ target: { value } }) => {
    this.setState({
      message: value
    });
  };

  onSubmitMessage = async () => {
    const { selected, subject, message } = this.state;

    const sent = await post({
      path: `messages/${selected}`,
      options: {
        body: {
          time_to_live: 3600,
          content: {
            subject,
            markdown: message
          }
        }
      }
    });
  };

  render() {
    const { code, subject, message, selected, contacts } = this.state;

    return (
      <section className="container home--container mt-5 mb-5">
        <Card className="border border-primary rounded h-100 p-3">
          <Row className="h-100">
            <Col lg="4" className="d-flex flex-column">
              <h1 className="display-4 text-center">Rubrica</h1>

              <InputGroup className="pb-3">
                <Input
                  className="border-0"
                  placeholder="Codice Fiscale"
                  aria-label="Codice Fiscale"
                  minLength="16"
                  maxLength="16"
                  value={code}
                  onChange={this.onInputCode}
                />
                <InputGroupAddon addonType="append" onClick={this.onInputAdd}>
                  <span className="border-0 input-group-text it-close icon-rotate-45deg cursor-pointer" />
                </InputGroupAddon>
              </InputGroup>

              <ListGroup className="flex-1">
                {(() => {
                  return Object.keys(contacts).map(key => {
                    const contact = contacts[key];

                    return (
                      <ListGroupItem
                        className="cursor-pointer"
                        active={contact.active}
                        onClick={() => this.onContactSelect(key)}
                        key={key}
                      >
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
            <Col lg="8" className="d-flex flex-column">
              <h1 className="display-4 text-center">Messaggio</h1>
              <Input
                type="text"
                name="text"
                placeholder="Titolo"
                minLength="10"
                maxLength="120"
                onChange={this.onChangeSubject}
              />
              <Input
                type="textarea"
                name="text"
                className="flex-1"
                minLength="80"
                maxLength="10000"
                onChange={this.onChangeMessage}
              />

              <ReactMarkdown
                className="home--message--preview flex-1 mt-5"
                source={message}
                unwrapDisallowed
                allowedTypes={[
                  "root",
                  "break",
                  "paragraph",
                  "emphasis",
                  "strong",
                  // "thematicBreak",
                  // "blockquote",
                  "delete",
                  // "link",
                  // "image",
                  // "linkReference",
                  // "imageReference",
                  // "table",
                  // "tableHead",
                  // "tableBody",
                  // "tableRow",
                  // "tableCell",
                  "list",
                  "listItem",
                  // "definition",
                  "heading"
                  // "inlineCode",
                  // "code",
                  // "html",
                  // "virtualHtml"
                ]}
              />
            </Col>
          </Row>

          <Row>
            <Col lg={{ size: 8, offset: 4 }}>
              <Button
                block
                color="primary"
                disabled={!selected || !subject || !message}
                onClick={this.onSubmitMessage}
              >
                Invia
              </Button>
            </Col>
          </Row>
        </Card>
      </section>
    );
  }
}

export default Home;
