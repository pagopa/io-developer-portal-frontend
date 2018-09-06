import React, { Component, Fragment } from "react";

import { withDB, Find } from "react-pouchdb/browser";

import MessageStats from "../components/messages/MessageStats";

import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";

class Messages extends Component {
  state = {
    templates: [],
    messages: [],
    batches: [],
    stats: {}
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
          $in: [null, ""]
        }
      }
    });
    const batches = await db.find({
      selector: {
        type: "batch"
      }
    });
    const counts = await db.query(
      {
        map: doc => {
          if (doc.type === "message") emit(doc.batchId, 1);
        },
        reduce: "_count"
      },
      { reduce: true, group: true }
    );

    const stats = {};
    counts.rows.forEach(count => {
      stats[count.key || "none"] = count.value;
    });

    this.setState({
      templates: templates.docs,
      messages: messages.docs,
      batches: batches.docs,
      stats
    });
  };

  render() {
    const { templates, messages, batches, stats } = this.state;
    const { db } = this.props;

    console.log(stats);

    const batchesMessages = batches
      .filter(batch => {
        if (!stats[batch._id]) {
          return false;
        }
        return true;
      })
      .map(batch =>
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
        <table className="table mb-0 rounded">
          <thead>
            <tr>
              <th className="border-0">
                <span className="text-uppercase font-weight-normal">Data</span>
              </th>
              <th className="border-0">
                <span className="text-uppercase font-weight-normal">
                  Oggetto
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal">
                  Consegnati
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal">
                  Falliti
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal">
                  In coda
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal" />
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
