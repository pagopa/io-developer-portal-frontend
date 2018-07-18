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
          return docs.map(template => {
            return (
              <Fragment key={template._id}>
                <AccordionHeader
                  active={selected === template._id}
                  onToggle={() => this.onSetSelected(template._id)}
                >
                  {template.subject}
                </AccordionHeader>
                <AccordionBody active={selected === template._id}>
                  <div className="d-flex w-100 justify-content-around">
                    <Link
                      className="btn btn-primary mb-3"
                      to={`templates/${template._id}`}
                    >
                      Modifica
                    </Link>
                    <Link
                      className="btn btn-primary mb-3"
                      to={{
                        pathname: "message",
                        state: {
                          type: "list",
                          templateId: template._id
                        }
                      }}
                    >
                      Invia ad una lista
                    </Link>
                    <Link
                      className="btn btn-primary mb-3"
                      to={{
                        pathname: "message",
                        state: {
                          type: "single",
                          templateId: template._id
                        }
                      }}
                    >
                      Invia ad un destinatario
                    </Link>
                  </div>

                  <MessagePreview message={template} />
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
