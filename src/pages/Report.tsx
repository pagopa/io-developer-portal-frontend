import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { Find, withDB } from "react-pouchdb/browser";

import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Col,
  Row
} from "design-react-kit";

import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import moment from "moment";
import compose from "recompose/compose";

import { getStatsFor } from "../utils/stats";

import { RouteComponentProps } from "react-router";
import MessageListReport from "../components/messages/MessageListReport";
import MessagePreview from "../components/messages/MessagePreview";

type Props = {
  db: any;
};
type ReportProps = RouteComponentProps<{
  entry_type: string;
  entry_id: string;
}> &
  WithNamespaces &
  Props;

type ReportState = {
  statuses: any;
  selected: string;
};

class Report extends Component<ReportProps, ReportState> {
  public state: ReportState = {
    statuses: {},
    selected: ""
  };

  public componentDidMount = async () => {
    const {
      db,
      match: {
        params: { entry_type, entry_id }
      }
    } = this.props;
    const entry = await db.find({
      selector: { type: entry_type, _id: entry_id }
    });

    const statuses = await getStatsFor(entry.docs[0], db);

    this.setState({
      statuses
    });
  };

  public onSetSelected = (selected: string) => {
    this.setState((prevState, props) => {
      selected = prevState.selected === selected ? "" : selected;
      return {
        selected
      };
    });
  };

  public render() {
    const { statuses, selected } = this.state;
    const {
      match: {
        params: { entry_type, entry_id }
      }
    } = this.props;
    const { t } = this.props;

    return (
      <Find
        selector={{
          type: "message",
          [entry_type === "batch" ? `batchId` : `_id`]: entry_id
        }}
        render={({ docs }: any) => {
          if (!docs.length) {
            return null;
          }
          const messages = sortBy(docs, ["message.created_at"]);
          const groups = groupBy(messages, "status");

          const { message, templateId } = messages[0];
          return (
            <Find
              selector={{
                type: "template",
                _id: templateId
              }}
              render={({ docs }: any) => {
                if (!docs.length) {
                  return null;
                }

                const template = docs[0];
                return (
                  <Row>
                    <Col lg="6">
                      <h1 className="display-3">{template.subject}</h1>
                    </Col>
                    <Col lg="5" className="text-right">
                      {moment(message.created_at).format(t("format:date"))}
                    </Col>

                    <Col lg="11">
                      <hr />
                      <Accordion className="border-0">
                        <AccordionHeader
                          className="border-0 p-2 text-decoration-none font-weight-normal"
                          active={selected === "PROCESSED"}
                          onToggle={() => this.onSetSelected("PROCESSED")}
                        >
                          <span className="text-uppercase text-secondary">
                            {t("sent")}:
                            <span className="font-weight-bold">
                              {" "}
                              {statuses.PROCESSED}
                            </span>
                          </span>
                        </AccordionHeader>
                        <AccordionBody active={selected === "PROCESSED"}>
                          <MessageListReport list={groups.PROCESSED} />
                        </AccordionBody>
                      </Accordion>
                    </Col>

                    <Col lg="11">
                      <hr />
                      <Accordion className="border-0">
                        <AccordionHeader
                          className="border-0 p-2 text-decoration-none font-weight-normal"
                          active={selected === "ERRORED"}
                          onToggle={() => this.onSetSelected("ERRORED")}
                        >
                          <span className="text-uppercase text-secondary">
                            {t("failed")}:
                            <span className="font-weight-bold">
                              {" "}
                              {statuses.ERRORED}
                            </span>
                          </span>
                        </AccordionHeader>
                        <AccordionBody active={selected === "ERRORED"}>
                          {/* 
                            ERRORED = FAILED + NOTSENT
                          */}
                          <MessageListReport list={groups.FAILED} />
                          <MessageListReport list={groups.NOTSENT} />
                        </AccordionBody>
                      </Accordion>
                    </Col>

                    <Col lg="11">
                      <hr />
                      <Accordion className="border-0">
                        <AccordionHeader
                          className="border-0 p-2 text-decoration-none font-weight-normal"
                          active={selected === "QUEUED"}
                          onToggle={() => this.onSetSelected("QUEUED")}
                        >
                          <span className="text-uppercase text-secondary">
                            {t("queued")}:
                            <span className="font-weight-bold">
                              {" "}
                              {statuses.QUEUED}
                            </span>
                          </span>
                        </AccordionHeader>
                        <AccordionBody active={selected === "QUEUED"}>
                          {/* 
                            QUEUED = ACCEPTED + THROTTLED
                          */}
                          <MessageListReport list={groups.ACCEPTED} />
                          <MessageListReport list={groups.THROTTLED} />
                        </AccordionBody>
                      </Accordion>
                    </Col>

                    <Col lg="11" className="mt-5">
                      <MessagePreview message={template} />
                    </Col>
                  </Row>
                );
              }}
            />
          );
        }}
      />
    );
  }
}

const enhance = compose<ReportProps, ReportProps>(
  withDB,
  withNamespaces(["messages", "format"])
);

export default enhance(Report);
