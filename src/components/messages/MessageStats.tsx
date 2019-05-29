import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";

import { Link } from "react-router-dom";

import FaChevronRight from "react-icons/lib/fa/chevron-right";

import { TemplateDocument } from "../../pages/Message";
import { ExtendedBatchDocument } from "../../pages/Messages";
import { MessageDocument } from "../../utils/operations";
import { getStatsFor, Statistics } from "../../utils/stats";

import moment from "moment";
import compose from "recompose/compose";
import Database = PouchDB.Database;
import ExistingDocument = PouchDB.Core.ExistingDocument;

type MessageStatsState = {
  statuses: Statistics;
};

export type Entry =
  | ExistingDocument<MessageDocument>
  | ExistingDocument<ExtendedBatchDocument>;

type OwnProps = {
  db: Database<Entry>;
  entry: Entry;
  templates: { [templateId: string]: ExistingDocument<TemplateDocument> };
};
type Props = WithNamespaces & OwnProps;

class MessageStats extends Component<Props, MessageStatsState> {
  public state: MessageStatsState = {
    statuses: {
      PROCESSED: 0,
      FAILED: 0,
      ACCEPTED: 0,
      THROTTLED: 0,
      // Custom ones
      NOTSENT: 0,
      ERRORED: 0,
      QUEUED: 0,
      TOTAL: 0
    }
  };

  public componentDidMount = async () => {
    const { entry, db } = this.props;
    const statuses = await getStatsFor(entry, db);

    this.setState({
      statuses
    });
  };

  public render() {
    const { statuses } = this.state;
    const { templates, entry, t } = this.props;

    return (
      <tr className="font-weight-bold">
        <td>{moment(entry.message.created_at).format(t("format:date"))}</td>
        <td className="text-word-break">
          {templates[entry.templateId].subject}
        </td>
        <td>{statuses.PROCESSED}</td>
        <td>{statuses.ERRORED}</td>
        <td>{statuses.QUEUED}</td>
        <td>
          <Link
            className="large list-item"
            to={{ pathname: `/report/${entry.type}/${entry._id}` }}
          >
            <FaChevronRight />
          </Link>
        </td>
      </tr>
    );
  }
}

const enhance = compose<Props, Props>(
  withDB,
  withNamespaces("format")
);

export default enhance(MessageStats);
