import React, { Component } from "react";

import ContactAdd from "../components/contacts/ContactAdd";
import ContactsList from "../components/contacts/ContactsList";

import { withDB, Find } from "react-pouchdb/browser";

import { contactGetAndPersist, isMaskValid } from "../utils/";
import { codeMask } from "../utils/masks";

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
        <ContactAdd
          code={code}
          codeMask={codeMask}
          isCodeValid={isCodeValid}
          onInputCode={this.onInputCode}
          onInputAdd={this.onInputAdd}
        />

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
