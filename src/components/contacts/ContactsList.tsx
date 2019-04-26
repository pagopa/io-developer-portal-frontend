import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert, ListGroup, ListGroupItem } from "design-react-kit";

export interface ContactDoc {
  _id: string;
  sender_allowed: boolean;
  status: any;
};

const getUserIcon = ({ sender_allowed, status }: ContactDoc) => {
  if (sender_allowed === true) {
    return "it-check";
  } else if (sender_allowed === false) {
    return "it-no";
  }

  return "it-error";
};

type Props = {
  docs: any;
  selected?: any;
  onContactSelect?: any
};
type ContactsListProps = WithNamespaces & Props;

class ContactsList extends Component<ContactsListProps, never> {
  render() {
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
          return docs.map((contact: ContactDoc) => {
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
