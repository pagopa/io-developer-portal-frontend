import React, { Component, Fragment } from "react";

import { withDB, Find } from "react-pouchdb/browser";

import MessageStats from "../components/messages/MessageStats";

import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";

class Messages extends Component {
  state = {
    templates: [],
    messages: [],
    batches: []
  };

  componentDidMount = async () => {
    await this.queryDB();
  };

  queryDB = async () => {
    const { db } = this.props;

    const templates = await db.find({
      selector: {
        type: "template"
      }
    });
    const messages = await db.find({
      selector: {
        type: "message",
        batchId: {
          $eq: ""
        }
      }
    });
    const batches = await db.find({
      selector: {
        type: "batch"
      }
    });

    this.setState({
      templates: templates.docs,
      messages: messages.docs,
      batches: batches.docs
    });
  };

  render() {
    const { templates, messages, batches } = this.state;
    const { db } = this.props;

    const batchesMessages = batches.map(batch =>
      Object.assign({}, batch, {
        message: {
          created_at: batch.created_at
        }
      })
    );

    const templatesMap = keyBy(templates, template => {
      return template._id;
    });

    return (
      <div>
        <table className="table mb-0 border-0">
          <thead>
            <tr>
              <th>
                <span className="display-4">Data</span>
              </th>
              <th>
                <span className="display-4">Template</span>
              </th>
              <th style={{ width: "10%" }}>
                <span className="display-4">Consegnati</span>
              </th>
              <th style={{ width: "10%" }}>
                <span className="display-4">Falliti</span>
              </th>
              <th style={{ width: "10%" }}>
                <span className="display-4">In coda</span>
              </th>
              <th style={{ width: "10%" }}>
                <span className="display-4">Report</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orderBy(
              [].concat(messages, batchesMessages),
              ["message.created_at"],
              ["desc"]
            ).map(entry => {
              return (
                <MessageStats
                  key={entry._id}
                  templates={templatesMap}
                  entry={entry}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withDB(Messages);
