import React, { Component, Fragment } from "react";

import { withDB, Find } from "react-pouchdb/browser";
import { withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

import MessageStats from "../components/messages/MessageStats";

import compose from "recompose/compose";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";
import { emit } from 'cluster';

type MessagesState = {
  templates: undefined[],
  messages: undefined[],
  batches: undefined[],
  stats: {}
};

class Messages extends Component<any, MessagesState> {
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
    const { db, t } = this.props;

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

    const orderedMessages = orderBy(
      [].concat(messages, batchesMessages),
      ["message.created_at"],
      ["desc"]
    );

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
                  {t("subject")}
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal">
                  {t("sent")}
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal">
                  {t("failed")}
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal">
                  {t("queued")}
                </span>
              </th>
              <th className="border-0" style={{ width: "10%" }}>
                <span className="text-uppercase font-weight-normal" />
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (!orderedMessages.length) {
                return (
                  <tr>
                    <td colSpan={5}>
                      <Alert color="warning">{t("no_messages")}</Alert>
                    </td>
                  </tr>
                );
              }

              return orderedMessages.map(entry => {
                return (
                  <MessageStats
                    key={entry._id}
                    templates={templatesMap}
                    entry={entry}
                  />
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    );
  }
}

const enhance = compose(
  withDB,
  withNamespaces("messages")
);

export default enhance(Messages);
