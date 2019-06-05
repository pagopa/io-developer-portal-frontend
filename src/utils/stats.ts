import groupBy from "lodash/groupBy";
import Database = PouchDB.Database;
import { Entry } from "../components/messages/MessageStats";

export type Statistics = {
  PROCESSED: number;
  FAILED: number;
  ACCEPTED: number;
  THROTTLED: number;
  // Custom ones
  NOTSENT: number;
  ERRORED: number;
  QUEUED: number;
  TOTAL: number;
};

export const getStatsFor = async (
  entry: Entry,
  db: Database<Entry>
): Promise<Statistics> => {
  // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L140
  // The processing status of a message.
  // "ACCEPTED": the message has been accepted and will be processed for delivery;
  //   we'll try to store its content in the user's inbox and notify him on his preferred channels
  // "THROTTLED": a temporary failure caused a retry during the message processing;
  // any notification associated with this message will be delayed for a maximum of 7 days
  // "FAILED": a permanent failure caused the process to exit with an error, no notification will be sent for this message
  // "PROCESSED": the message was succesfully processed and is now stored in the user's inbox;
  // we'll try to send a notification for each of the selected channels

  const initialCount: Statistics = {
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

  async function getStatsForType(): Promise<Statistics> {
    switch (entry.type) {
      case "message":
        return entry.status
          ? {
              ...initialCount,
              [entry.status]: 1
            }
          : initialCount;
      case "batch":
        const messages = await db.find({
          selector: {
            type: "message",
            batchId: entry._id
          }
        });

        const statusesGroups = groupBy(messages.docs, "status");
        return Object.keys(statusesGroups).reduce(
          (previousPartial: Statistics, currentKey) => {
            return {
              ...previousPartial,
              [currentKey]: statusesGroups[currentKey].length
            };
          },
          initialCount
        );
      default:
        return initialCount;
    }
  }

  const partialCount = await getStatsForType();

  const QUEUED = partialCount.ACCEPTED + partialCount.THROTTLED;
  const ERRORED = partialCount.FAILED + partialCount.NOTSENT;
  const TOTAL = partialCount.PROCESSED + QUEUED + ERRORED;

  return {
    ...partialCount,
    QUEUED,
    ERRORED,
    TOTAL
  };
};

export default { getStatsFor };
