import { get, post } from "./api";

import { conformToMask } from "react-text-mask";

import moment from "moment";

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
