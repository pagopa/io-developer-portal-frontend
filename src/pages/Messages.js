import React, { Component, Fragment } from "react";

import { withDB, Find } from "react-pouchdb/browser";

import groupBy from "lodash/groupBy";

class Messages extends Component {
  render() {
    const { db } = this.props;

    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L140
    // The processing status of a message.
    // "ACCEPTED": the message has been accepted and will be processed for delivery;
    //   we'll try to store its content in the user's inbox and notify him on his preferred channels
    // "THROTTLED": a temporary failure caused a retry during the message processing;
    // any notification associated with this message will be delayed for a maximum of 7 days
    // "FAILED": a permanent failure caused the process to exit with an error, no notification will be sent for this message
    // "PROCESSED": the message was succesfully processed and is now stored in the user's inbox;
    // we'll try to send a notification for each of the selected channels

    return (
      <div>
        <table className="table mb-0 border-0">
          <thead>
            <tr>
              <th>
                <span className="display-4">Template</span>
              </th>
              <th style={{ width: "20%" }}>
                <span className="display-4">Consegnati</span>
              </th>
              <th style={{ width: "20%" }}>
                <span className="display-4">Falliti</span>
              </th>
              <th style={{ width: "20%" }}>
                <span className="display-4">In coda</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <Find
              selector={{
                type: "template"
              }}
              sort={["_id"]}
              render={({ docs }) => {
                return docs.map(template => (
                  <tr key={template._id}>
                    <Find
                      selector={{
                        type: "message",
                        templateId: template._id
                      }}
                      sort={["_id"]}
                      render={({ docs }) => {
                        const statuses = groupBy(docs, "status");

                        return (
                          <Fragment>
                            <td className="border-0">{template.subject}</td>
                            <td className="border-0">
                              {statuses["PROCESSED"]
                                ? statuses["PROCESSED"].length
                                : 0}
                            </td>
                            <td className="border-0">
                              {(() => {
                                const failed = statuses["FAILED"]
                                  ? statuses["FAILED"].length
                                  : 0;
                                const notsent = statuses["NOTSENT"]
                                  ? statuses["NOTSENT"].length
                                  : 0;

                                return failed + notsent;
                              })()}
                            </td>
                            <td className="border-0">
                              {(() => {
                                const accepted = statuses["ACCEPTED"]
                                  ? statuses["ACCEPTED"].length
                                  : 0;
                                const throttled = statuses["THROTTLED"]
                                  ? statuses["THROTTLED"].length
                                  : 0;

                                return accepted + throttled;
                              })()}
                            </td>
                          </Fragment>
                        );
                      }}
                    />
                  </tr>
                ));
              }}
            />
          </tbody>
        </table>
      </div>
    );
  }
}

export default withDB(Messages);
