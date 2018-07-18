import React, { Component } from "react";

import { InputGroup, InputGroupAddon, Input } from "design-react-kit";

import ContactsList from "../components/contacts/ContactsList";

import { withDB, Find } from "react-pouchdb/browser";

import { contactGetAndPersist } from "../utils";

class Contacts extends Component {
  initialState = {
    selected: "",
    code: ""
  };

  state = {
    selected: this.initialState.selected,
    code: this.initialState.code
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
        const { db } = this.props;
        await contactGetAndPersist({ db, code });
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

  render() {
    const { code } = this.state;

    return (
      <section>
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
          render={({ docs }) => <ContactsList docs={docs} />}
        />
      </section>
    );
  }
}

export default withDB(Contacts);
