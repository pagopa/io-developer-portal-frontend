import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert, ListGroup, ListGroupItem } from "design-react-kit";
import { ExistingDocument } from "react-pouchdb/browser";
import { ContactDocument } from "../../workers/getProfile";

const getUserIcon = ({ sender_allowed }: ContactDocument) => {
  if (sender_allowed === true) {
    return "it-check";
  } else if (sender_allowed === false) {
    return "it-no";
  }

  return "it-error";
};

type OwnProps = {
  docs: ReadonlyArray<ExistingDocument<ContactDocument>>;
  selected?: string;
  onContactSelect?: (selected: string) => void;
};
type Props = WithNamespaces & OwnProps;

class ContactsList extends Component<Props, never> {
  public render() {
    const { docs, selected, onContactSelect } = this.props;
    const { t } = this.props;

    if (!docs) {
      return null;
    }

    return (
      <ListGroup className="flex-1">
        {(() => {
          if (!docs.length) {
            return <Alert color="warning">{t("no_contacts")}</Alert>;
          }
          return docs.map(contact => {
            return (
              <ListGroupItem
                key={contact._id}
                active={selected === contact._id}
              >
                <div
                  className={`d-flex w-100 justify-content-between ${
                    onContactSelect ? "cursor-pointer" : ""
                  }`}
                  onClick={() =>
                    onContactSelect && onContactSelect(contact._id)
                  }
                >
                  <div>{contact._id}</div>
                  <div>
                    <i className={`${getUserIcon(contact)}`} />
                  </div>
                </div>
              </ListGroupItem>
            );
          });
        })()}
      </ListGroup>
    );
  }
}

export default withNamespaces("contacts")(ContactsList);
