import React, { Component, Fragment } from "react";

import { Link } from "react-router-dom";

import { Accordion, AccordionHeader, AccordionBody } from "design-react-kit";

import MessagePreview from "../messages/MessagePreview";

class TemplatesList extends Component {
  state = {
    selected: ""
  };

  onSetSelected = selected => {
    this.setState((prevState, props) => {
      selected = prevState.selected === selected ? "" : selected;
      return {
        selected
      };
    });
  };

  render() {
    const { selected } = this.state;
    const { docs } = this.props;

    return (
      <Accordion>
        {(() => {
          return docs.map(message => {
            return (
              <Fragment key={message._id}>
                <AccordionHeader
                  active={selected === message._id}
                  onToggle={() => this.onSetSelected(message._id)}
                >
                  {message.subject}
                </AccordionHeader>
                <AccordionBody active={selected === message._id}>
                  <div className="d-flex w-100 justify-content-around">
                    <Link
                      className="btn btn-primary mb-3"
                      to={`templates/${message._id}`}
                    >
                      Modifica
                    </Link>
                    <Link
                      className="btn disabled mb-3"
                      to={`templates/${message._id}`}
                    >
                      Invia ad una lista
                    </Link>
                    <Link
                      className="btn btn-primary mb-3"
                      to={{ pathname: "message", state: message._id }}
                    >
                      Invia ad un destinatario
                    </Link>
                  </div>

                  <MessagePreview message={message} />
                </AccordionBody>
              </Fragment>
            );
          });
        })()}

        {(() => {
          if (docs.length) {
            return <div className="mb-3" />;
          }
        })()}
      </Accordion>
    );
  }
}

export default TemplatesList;
