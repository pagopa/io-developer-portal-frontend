import React, { Component, Fragment } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Link } from "react-router-dom";

import {
  Alert,
  Accordion,
  AccordionHeader,
  AccordionBody,
  UncontrolledTooltip
} from "design-react-kit";

import MessagePreview from "../messages/MessagePreview";

import Edit from "react-icons/lib/fa/edit";
import Group from "react-icons/lib/fa/group";
import User from "react-icons/lib/fa/user";

import "./TemplatesList.css";

type Props = {
  docs: any;
};
type TemplatesListProps = WithNamespaces & Props;

type TemplatesListState = {
  selected: string
};

interface Template {
  _id: string;
  subject: any;
}

class TemplatesList extends Component<TemplatesListProps, TemplatesListState> {
  state = {
    selected: ""
  };

  onSetSelected = (selected: string) => {
    this.setState((prevState, props) => {
      selected = prevState.selected === selected ? "" : selected;
      return {
        selected
      };
    });
  };

  render() {
    const { selected } = this.state;
    const { docs, t } = this.props;

    if (!docs.length) {
      return <Alert color="warning">Non ci sono template salvati</Alert>;
    }

    return (
      <Accordion>
        {(() => {
          return docs.map((template: Template) => {
            return (
              <Fragment key={template._id}>
                <AccordionHeader
                  tag="div"
                  className="templateslist--collapse-header position-relative"
                  active={selected === template._id}
                  onToggle={() => this.onSetSelected(template._id)}
                >
                  <div className="d-flex w-90">
                    <div className="flex-1">{template.subject}</div>
                    <div className="flex-1 d-flex justify-content-around">
                      <Link
                        id={`edit-${template._id}`}
                        className="pl-3 pr-3"
                        to={`templates/${template._id}`}
                      >
                        <Edit />
                      </Link>
                      <Link
                        id={`list-${template._id}`}
                        className="pl-3 pr-3"
                        to={{
                          pathname: "message",
                          state: {
                            type: "list",
                            templateId: template._id
                          }
                        }}
                      >
                        <Group />
                      </Link>
                      <Link
                        id={`single-${template._id}`}
                        className="pl-3 pr-3"
                        to={{
                          pathname: "message",
                          state: {
                            type: "single",
                            templateId: template._id
                          }
                        }}
                      >
                        <User />
                      </Link>

                      <UncontrolledTooltip
                        placement="top"
                        target={`edit-${template._id}`}
                      >
                        {t("edit")}
                      </UncontrolledTooltip>
                      <UncontrolledTooltip
                        placement="top"
                        target={`single-${template._id}`}
                      >
                        {t("send")}
                      </UncontrolledTooltip>
                      <UncontrolledTooltip
                        placement="top"
                        target={`list-${template._id}`}
                      >
                        {t("send_batch")}
                      </UncontrolledTooltip>
                    </div>
                  </div>
                </AccordionHeader>
                <AccordionBody active={selected === template._id}>
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

export default withNamespaces("templates")(TemplatesList);
