import React, { Component } from "react";

import { InputGroup, InputGroupAddon } from "design-react-kit";
import MaskedInput from "react-text-mask";

class ContactAdd extends Component {
  render() {
    const { code, codeMask, isCodeValid, onInputCode, onInputAdd } = this.props;

    return (
      <InputGroup className="pb-3">
        <MaskedInput
          type="text"
          autoFocus
          className="form-control shadow-none"
          placeholder="Codice Fiscale"
          aria-label="Codice Fiscale"
          minLength="16"
          maxLength="16"
          value={code}
          guide={false}
          mask={codeMask}
          onChange={onInputCode}
        />

        {onInputAdd && (
          <InputGroupAddon
            addonType="append"
            onClick={() => isCodeValid && onInputAdd()}
          >
            <span
              className={`border-0 input-group-text it-close icon-rotate-45deg ${
                isCodeValid ? "cursor-pointer" : ""
              }`}
            />
          </InputGroupAddon>
        )}
        {code &&
          !isCodeValid && (
            <div className="invalid-feedback d-block">
              Per favore digita 16 caratteri alfanumerici
            </div>
          )}
      </InputGroup>
    );
  }
}

export default ContactAdd;
