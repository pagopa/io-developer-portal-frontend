import React, { Component, Fragment } from "react";

import { withDB } from "react-pouchdb/browser";

import { Link } from "react-router-dom";

import FaChevronRight from "react-icons/lib/fa/chevron-right";

import { getStatsFor } from "../../utils/";

import moment from "moment";

class MessageStats extends Component {
  state = {
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
    const { templates, entry } = this.props;

    return (
      <tr>
        <td className="border-0">
          {moment(entry.message.created_at).format("DD/MM/YYYY, HH:mm")}
        </td>
        <td className="border-0">{templates[entry.templateId].subject}</td>
        <td className="border-0">{statuses.PROCESSED}</td>
        <td className="border-0">{statuses.ERRORED}</td>
        <td className="border-0">{statuses.QUEUED}</td>
        <td className="border-0">
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

export default withDB(MessageStats);
