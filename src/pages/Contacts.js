import React, { Component } from "react";

import { InputGroup, InputGroupAddon, Input } from "design-react-kit";
import MaskedInput from "react-text-mask";

import ContactsList from "../components/contacts/ContactsList";

import { withDB, Find } from "react-pouchdb/browser";

import { contactGetAndPersist, isMaskValid } from "../utils";

// ^[A-Za-z]{6}[0-9LMNPQRSTUV]{2}[A-Za-z]{1}[0-9LMNPQRSTUV]{2}[A-Za-z]{1}[0-9LMNPQRSTUV]{3}[A-Za-z]{1}$
const codeMask = [
  ...new Array(6).fill(/[A-Za-z]/),
  ...new Array(2).fill(/[0-9LMNPQRSTUV]/),
  /[A-Za-z]/,
  ...new Array(2).fill(/[0-9LMNPQRSTUV]/),
  /[A-Za-z]/,
  ...new Array(3).fill(/[0-9LMNPQRSTUV]/),
  /[A-Za-z]/
];

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
    const isCodeValid = isMaskValid(code, codeMask);

    return (
      <section>
        <InputGroup className="pb-3">
          <MaskedInput
            type="text"
            className="form-control border-0 shadow-none"
            placeholder="Codice Fiscale"
            aria-label="Codice Fiscale"
            minLength="16"
            maxLength="16"
            value={code}
            guide={false}
            mask={codeMask}
            onChange={this.onInputCode}
          />

          <InputGroupAddon
            addonType="append"
            onClick={() => isCodeValid && this.onInputAdd()}
          >
            <span
              className={`border-0 input-group-text it-close icon-rotate-45deg ${
                isCodeValid ? "cursor-pointer" : ""
              }`}
            />
          </InputGroupAddon>
          {code &&
            !isCodeValid && (
              <div className="invalid-feedback d-block">
                Per favore digita 16 caratteri alfanumerici
              </div>
            )}
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
