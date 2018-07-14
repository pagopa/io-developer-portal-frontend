import React, { Component } from "react";

import {
  Col,
  Row,
  Card,
  Form,
  InputGroup,
  InputGroupAddon,
  Input,
  FormGroup,
  Label,
  Button
} from "design-react-kit";

import ContactsList from "../components/contacts/ContactsList";
import MessagesEditor from "../components/messages/MessagesEditor";

import { withDB, Find } from "react-pouchdb/browser";

import { get, post } from "../api";

import "./Home.css";

class Home extends Component {
  initialState = {
    code: "",
    subject: "",
    markdown: "",
    selected: "",
    contacts: {}
  };

  state = {
    code: this.initialState.code,
    subject: this.initialState.subject,
    markdown: this.initialState.markdown,
    selected: this.initialState.selected,
    contacts: this.initialState.contacts
  };

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

        const { db } = this.props;

        db.put({
          _id: code,
          type: "contact",
          ...profile
        });
      }
    );
  };

  onContactSelect = code => {
    this.setState((prevState, props) => {
      return {
        selected: code
      };
    });
  };

  onChangeSubject = ({ target: { value } }) => {
    this.setState({
      subject: value
    });
  };

  onChangeMarkdown = ({ target: { value } }) => {
    this.setState({
      markdown: value
    });
  };

  onSubmitMessage = () => {
    const { selected, subject, markdown } = this.state;

    this.setState(
      {
        subject: this.initialState.subject,
        markdown: this.initialState.markdown
      },
      async () => {
        const sent = await post({
          path: `messages/${selected}`,
          options: {
            body: {
              time_to_live: 3600,
              content: {
                subject,
                markdown: markdown
              }
            }
          }
        });

        const { db } = this.props;

        db.put({
          _id: sent.id,
          type: "message",
          userId: selected
        });
      }
    );
  };

  render() {
    const { code, subject, markdown, selected, contacts } = this.state;

    return (
      <section className="container home--container mt-5 mb-5">
        <Card className="border border-primary rounded h-100 p-3">
          <Row className="h-100">
            <Col lg="4" className="d-flex flex-column border-right">
              <h1 className="display-4 text-center border-bottom pb-3">
                Rubrica
              </h1>

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

              <Find
                selector={{
                  type: "contact"
                }}
                sort={["_id"]}
                render={({ docs }) => (
                  <ContactsList
                    docs={docs}
                    selected={selected}
                    onContactSelect={this.onContactSelect}
                  />
                )}
              />
            </Col>
            <Col lg="8" className="d-flex flex-column">
              <h1 className="display-4 text-center border-bottom pb-3">
                Messaggio
              </h1>

              <MessagesEditor
                subject={subject}
                markdown={markdown}
                onChangeSubject={this.onChangeSubject}
                onChangeMarkdown={this.onChangeMarkdown}
              />

              <Button
                block
                color="primary"
                disabled={!selected || !subject || !markdown}
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

export default withDB(Home);
