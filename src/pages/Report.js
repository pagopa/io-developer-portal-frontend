import React, { Component } from "react";

import { withDB, Find } from "react-pouchdb/browser";

import { Row, Col } from "design-react-kit";

import sortBy from "lodash/sortBy";
import groupBy from "lodash/groupBy";
import moment from "moment";

import { getStatsFor } from "../utils/";
import MessageListReport from "../components/messages/MessageListReport";

class Report extends Component {
  state = {
    statuses: {}
  };

  componentDidMount = async () => {
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

  render() {
    const { statuses } = this.state;
    const {
      match: {
        params: { entry_type, entry_id }
      }
    } = this.props;

    return (
      <Find
        selector={{
          type: "message",
          [entry_type === "batch" ? `batchId` : `_id`]: entry_id
        }}
        render={({ docs }) => {
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
              render={({ docs }) => {
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
                      {moment(message.created_at).format("DD/MM/YYYY, HH:mm")}
                    </Col>
                    <Col lg="12">
                      <hr />
                      <Row>
                        <Col lg="4">Consegnati: {statuses.PROCESSED}</Col>
                        <Col lg="8">
                          <MessageListReport list={groups.PROCESSED} />
                        </Col>
                      </Row>
                    </Col>
                    <Col lg="12">
                      <hr />
                      <Row>
                        <Col lg="4">Falliti: {statuses.ERRORED}</Col>
                        <Col lg="8">
                          {/* 
                          ERRORED = FAILED + NOTSENT
                        */}
                          <MessageListReport list={groups.FAILED} />
                          <MessageListReport list={groups.NOTSENT} />
                        </Col>
                      </Row>
                    </Col>
                    <Col lg="12">
                      <hr />
                      <Row>
                        <Col lg="4">In coda: {statuses.QUEUED}</Col>
                        <Col lg="8">
                          {/* 
                          QUEUED = ACCEPTED + THROTTLED
                        */}
                          <MessageListReport list={groups.ACCEPTED} />
                          <MessageListReport list={groups.THROTTLED} />
                        </Col>
                      </Row>
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

export default withDB(Report);
