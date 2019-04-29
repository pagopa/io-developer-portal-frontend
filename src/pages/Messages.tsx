import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";

import { Alert } from "design-react-kit";

import MessageStats from "../components/messages/MessageStats";

import { emit } from "cluster";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import compose from "recompose/compose";

type Props = {
  db: any;
};
type MessagesProps = WithNamespaces & Props;

type MessagesState = {
  templates: ReadonlyArray<any>;
  messages: ReadonlyArray<any>;
  batches: ReadonlyArray<any>;
  stats: any;
};

class Messages extends Component<MessagesProps, MessagesState> {
  public state: MessagesState = {
    templates: [],
    messages: [],
    batches: [],
    stats: {}
  };

  public componentDidMount = async () => {
    await this.queryDB();
  };

  public queryDB = async () => {
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
        map: (doc: any) => {
          if (doc.type === "message") {
            emit(doc.batchId, 1);
          }
        },
        reduce: "_count"
      },
      { reduce: true, group: true }
    );

    const stats: any = {};
    counts.rows.forEach((count: any) => {
      stats[count.key || "none"] = count.value;
    });

    this.setState({
      templates: templates.docs,
      messages: messages.docs,
      batches: batches.docs,
      stats
    });
  };

  public render() {
    const { templates, messages, batches, stats } = this.state;
    const { db, t, tReady, i18n } = this.props;

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
      messages.concat(batchesMessages),
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
                    t={t}
                    tReady={tReady}
                    i18n={i18n}
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

const enhance = compose<MessagesProps, MessagesProps>(
  withDB,
  withNamespaces("messages")
);

export default enhance(Messages);
