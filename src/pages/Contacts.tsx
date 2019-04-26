import React, { ChangeEvent, Component } from "react";

import ContactAdd from "../components/contacts/ContactAdd";
import ContactsList, { ContactDoc } from "../components/contacts/ContactsList";

import { withDB, Find } from "react-pouchdb/browser";

import { profileGetAndPersist } from "../utils/operations";
import { codeMask } from "../utils/masks";
import { isMaskValid } from "../utils/validators";


type ContactsProps = {
  db: any;
};

type ContactsState = {
  selected: string,
  code: string
};

class Contacts extends Component<ContactsProps, ContactsState> {
  initialState: ContactsState = {
    selected: "",
    code: ""
  };

  state: ContactsState = {
    selected: this.initialState.selected,
    code: this.initialState.code
  };

  onInputCode = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
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
        await profileGetAndPersist({ db, code });
      }
    );
  };

  onContactSelect = (code: any) => {
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
          render={({ docs }: {docs: ContactDoc[]}) => <ContactsList docs={docs} />}
        />
      </section>
    );
  }
}

export default withDB(Contacts);
