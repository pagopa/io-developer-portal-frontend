import groupBy from "lodash/groupBy";

const getStatsFor = async (entry, db) => {
  // https://github.com/teamdigitale/io-functions/blob/master/api/definitions.yaml#L140
  // The processing status of a message.
  // "ACCEPTED": the message has been accepted and will be processed for delivery;
  //   we'll try to store its content in the user's inbox and notify him on his preferred channels
  // "THROTTLED": a temporary failure caused a retry during the message processing;
  // any notification associated with this message will be delayed for a maximum of 7 days
  // "FAILED": a permanent failure caused the process to exit with an error, no notification will be sent for this message
  // "PROCESSED": the message was succesfully processed and is now stored in the user's inbox;
  // we'll try to send a notification for each of the selected channels

  const statuses = {
    PROCESSED: 0,
    FAILED: 0,
    ACCEPTED: 0,
    THROTTLED: 0,
    // Custom ones
    NOTSENT: 0,
    ERRORED: 0,
    QUEUED: 0,
    TOTAL: 0
  };

  if (entry.type === "message") {
    const { status } = entry;
    statuses[status] = 1;
  } else if (entry.type === "batch") {
    const messages = await db.find({
      selector: {
        type: "message",
        batchId: entry._id
      }
    });

    const statusesGroups = groupBy(messages.docs, "status");
    Object.keys(statusesGroups).map(key => {
      statuses[key] = statusesGroups[key].length;
    });
  }

  statuses.QUEUED = statuses.ACCEPTED + statuses.THROTTLED;
  statuses.ERRORED = statuses.FAILED + statuses.NOTSENT;
  statuses.TOTAL = (["PROCESSED", "QUEUED", "ERRORED"]).reduce((acc, key) => {
    return acc + statuses[key];
  }, 0);
  
  return statuses;
};

module.exports.getStatsFor = getStatsFor;
