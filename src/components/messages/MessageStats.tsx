import React, { Component, Fragment } from "react";

import { withDB } from "react-pouchdb/browser";
import { WithNamespaces, withNamespaces } from "react-i18next";

import { Link } from "react-router-dom";

import FaChevronRight from "react-icons/lib/fa/chevron-right";

import { getStatsFor } from "../../utils/stats";

import compose from "recompose/compose";
import moment from "moment";

type MessageStatsState = {
  statuses: any
};

type Props = {
  db?: any,
  entry: any,
  templates: any,
};
type MessageStatsProps =  WithNamespaces & Props;

class MessageStats extends Component<MessageStatsProps, MessageStatsState> {
  state: MessageStatsState = {
    statuses: {}
  };

  componentDidMount = async () => {
    const { entry, db } = this.props;
    const statuses = await getStatsFor(entry, db);

    this.setState({
      statuses
    });
  };

  render() {
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

const enhance = compose<MessageStatsProps, MessageStatsProps>(
  withDB,
  withNamespaces("format")
);

export default enhance(MessageStats);
