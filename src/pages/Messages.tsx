import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";

import { Alert } from "design-react-kit";

import MessageStats from "../components/messages/MessageStats";
import { MessageDocument } from "../utils/operations";
import { BatchDocument, TemplateDocument } from "./Message";

import { emit } from "cluster";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import compose from "recompose/compose";
import Database = PouchDB.Database;
import ExistingDocument = PouchDB.Core.ExistingDocument;

type Document = TemplateDocument | BatchDocument | MessageDocument;

export type ExtendedBatchDocument = BatchDocument & {
  message: {
    created_at: string;
  };
};

function isMessageDocument(document: Document): document is MessageDocument {
  return document.type === "message";
}

type OwnProps = {
  db: Database<Document>;
};
type Props = WithNamespaces & OwnProps;

type MessagesState = {
  templates: ReadonlyArray<ExistingDocument<TemplateDocument>>;
  messages: ReadonlyArray<ExistingDocument<MessageDocument>>;
  batches: ReadonlyArray<ExistingDocument<BatchDocument>>;
  stats: { [key: string]: number };
};

class Messages extends Component<Props, MessagesState> {
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

    const templates = await (db as Database<TemplateDocument>).find({
      selector: {
        type: "template"
      }
    });
    const messages = await (db as Database<MessageDocument>).find({
      selector: {
        type: "message",
        batchId: {
          $in: [null, ""]
        }
      }
    });
    const batches = await (db as Database<BatchDocument>).find({
      selector: {
        type: "batch"
      }
    });
    const counts = await db.query(
      {
        map: doc => {
          if (isMessageDocument(doc)) {
            emit(doc.batchId, 1);
          }
        },
        reduce: "_count"
      },
      { reduce: true, group: true }
    );

    const stats = counts.rows.reduce(
      (previousStats: { [key: string]: number }, currentCount) => {
        return {
          ...previousStats,
          [currentCount.key || "none"]: currentCount.value
        };
      },
      {}
    );

    this.setState({
      templates: templates.docs,
      messages: messages.docs,
      batches: batches.docs,
      stats
    });
  };

  public render() {
    const { templates, messages, batches, stats } = this.state;
    const { t, tReady, i18n, db } = this.props;

    const batchesMessages: ReadonlyArray<
      ExistingDocument<ExtendedBatchDocument>
    > = batches
      .filter(batch => {
        return stats[batch._id];
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
      [...messages, ...batchesMessages],
      ["message.created_at"],
      ["desc"]
    );

    return (
      <div className="mt-4 mr-4 ml-4 pt-5 pr-5 pl-5">
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
                    db={db as Database<MessageDocument>}
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

const enhance = compose<Props, Props>(
  withDB,
  withNamespaces("messages")
);

export default enhance(Messages);
