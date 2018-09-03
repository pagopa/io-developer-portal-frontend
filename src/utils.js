import { get, post } from "./api";

import { conformToMask } from "react-text-mask";

import moment from "moment";
import groupBy from "lodash/groupBy";

const tryAndPut = (db, doc) => {
  return db.put(doc).then(
    res => {
      return {
        updated: true,
        rev: res.rev,
        id: doc._id
      };
    },
    err => {
      if (err.status !== 409) {
        throw err;
      }
      return upsert(db, doc._id, doc);
    }
  );
};

const upsert = (db, docId, newDoc) => {
  if (typeof docId !== "string") {
    throw new Error("doc id is required");
  }

  return db
    .get(docId)
    .catch(err => {
      if (err.status !== 404) {
        throw err;
      }
      return {};
    })
    .then(doc => {
      // the user might change the _rev, so save it for posterity
      const docRev = doc._rev;

      // users aren't allowed to modify these values,
      // so reset them here
      newDoc._id = docId;
      newDoc._rev = docRev;
      return tryAndPut(db, newDoc);
    });
};

module.exports.upsert = upsert;

const contactGetAndPersist = async ({ db, code, batchId }) => {
  let profile = await get({ path: `profiles/${code}` });

  // The API returns errors with shape { detail, status, title }
  if (profile.status) {
    // Create an errored profile
    profile = { sender_allowed: null, status: profile.status };
  }

  const newDoc = {
    ...profile,
    type: "contact",
    batchId
  };

  return upsert(db, code, newDoc);
};

module.exports.contactGetAndPersist = contactGetAndPersist;

const messagePostAndPersist = async ({
  db,
  code,
  content,
  templateId,
  batchId
}) => {
  const sent = await post({
    path: `messages/${code}`,
    options: {
      body: {
        time_to_live: 3600,
        content
      }
    }
  });

  // The API returns errors with shape { detail, status, title }
  if (sent.status) {
    // Create an errored message
    return db.post({
      type: "message",
      status: "NOTSENT",
      message: {
        created_at: new Date().toISOString(),
        fiscal_code: code,
        ...sent
      },
      templateId,
      batchId
    });
  }

  const details = await get({
    path: `messages/${code}/${sent.id}`
  });

  return db.put({
    ...details,
    _id: sent.id,
    type: "message",
    templateId,
    batchId
  });
};

module.exports.messagePostAndPersist = messagePostAndPersist;

const createMessageContent = ({ message, dueDate, amount, notice }) => {
  let content = {
    subject: message.subject,
    markdown: message.markdown,
    due_date: dueDate && moment(dueDate).toISOString()
  };

  if (amount || notice) {
    content = Object.assign(content, {
      payment_data: {
        amount,
        notice_number: notice
      }
    });
  }

  return content;
};

module.exports.createMessageContent = createMessageContent;

const isMaskValid = (value, mask) => {
  return conformToMask(value, mask).conformedValue.indexOf("_") === -1;
};

module.exports.isMaskValid = isMaskValid;

const isLengthValid = (value, [min, max]) => {
  return isValueRangeValid(value.length, [min, max]);
};

module.exports.isLengthValid = isLengthValid;

const isValueRangeValid = (value, [min, max]) => {
  return value >= min && value <= max;
};

module.exports.isValueRangeValid = isValueRangeValid;

const getStatsFor = async (entry, db) => {
  // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L140
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
    QUEUED: 0
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
  return statuses;
};

module.exports.getStatsFor = getStatsFor;
