import React, { Component } from "react";

import { ListGroup, ListGroupItem } from "design-react-kit";

const getUserIcon = ({ sender_allowed, status }) => {
  if (sender_allowed === true) {
    return "it-check";
  } else if (sender_allowed === false) {
    return "it-no";
  }

  return "it-error";
};

class ContactsList extends Component {
  render() {
    const { docs, selected, onContactSelect } = this.props;

    if (!docs) {
      return null;
    }

    return (
      <ListGroup className="flex-1">
        {(() => {
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

export default ContactsList;
