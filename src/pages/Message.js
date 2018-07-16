import React, { Component } from "react";

import { Button } from "design-react-kit";

import { withDB, Find } from "react-pouchdb/browser";

import MessagePreview from "../components/messages/MessagePreview";
import ContactsList from "../components/contacts/ContactsList";

import { get, post } from "../api";

import "./Message.css";

class Message extends Component {
  state = {
    selected: ""
  };

  onContactSelect = selected => {
    this.setState({ selected });
  };

  onMessageSubmit = async () => {
    const { selected } = this.state;
    const {
      db,
      location: { state }
    } = this.props;

    const messages = await db.find({
      selector: { type: "template", _id: state }
    });
    const message = messages.docs[0];

    const sent = await post({
      path: `messages/${selected}`,
      options: {
        body: {
          time_to_live: 3600,
          content: {
            subject: message.subject,
            markdown: message.markdown
          }
        }
      }
    });

    db.put({
      _id: sent.id,
      type: "message",
      userId: selected
    });

    this.goHome();
  };

  goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.push(location);
  };

  render() {
    const { selected } = this.state;
    const {
      location: { state }
    } = this.props;

    return (
      <section>
        <h2 className="display-3">Contatti</h2>
        <div className="message--contacts-list mb-4">
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
        </div>

        <Find
          selector={{
            type: "template",
            _id: state
          }}
          render={({ docs }) => {
            const message = docs[0];

            if (!message) {
              return null;
            }
            return <MessagePreview message={message} />;
          }}
        />

        <Button
          className="mt-3"
          block
          color="primary"
          disabled={!selected}
          onClick={this.onMessageSubmit}
        >
          Invia
        </Button>
      </section>
    );
  }
}

export default withDB(Message);
