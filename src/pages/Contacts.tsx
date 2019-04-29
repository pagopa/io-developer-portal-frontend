import React, { ChangeEvent, Component } from "react";

import ContactAdd from "../components/contacts/ContactAdd";
import ContactsList, { ContactDoc } from "../components/contacts/ContactsList";

import { Find, withDB } from "react-pouchdb/browser";

import { codeMask } from "../utils/masks";
import { profileGetAndPersist } from "../utils/operations";
import { isMaskValid } from "../utils/validators";

type ContactsProps = {
  db: any;
};

type ContactsState = {
  selected: string;
  code: string;
};

class Contacts extends Component<ContactsProps, ContactsState> {
  public initialState: ContactsState = {
    selected: "",
    code: ""
  };

  public state: ContactsState = {
    selected: this.initialState.selected,
    code: this.initialState.code
  };

  public onInputCode = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      code: value
    });
  };

  public onInputAdd = () => {
    const code = this.state.code.toUpperCase();

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

  public onContactSelect = (code: any) => {
    this.setState((prevState, props) => {
      return {
        selected: code
      };
    });
  };

  public render() {
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
          render={({ docs }: { docs: readonly ContactDoc[] }) => (
            <ContactsList docs={docs} />
          )}
        />
      </section>
    );
  }
}

export default withDB(Contacts);
