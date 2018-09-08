import { get, post } from "./api";
import { upsert } from "./db";

import moment from "moment";

const profileGetAndPersist = async ({ db, dbName, url, code, batchId }) => {
  let profile = await get({ dbName, url, path: `profiles/${code}` });

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

module.exports.profileGetAndPersist = profileGetAndPersist;

const messagePostAndPersist = async ({
  db,
  code,
  content,
  templateId,
  batchId = ""
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
    const details = {
      message: {
        created_at: new Date().toISOString(),
        fiscal_code: code,
        ...sent
      }
    };

    // Create an errored message
    const operation = await db.post({
      ...details,
      type: "message",
      templateId,
      batchId,
      status: "NOTSENT"
    });

    return {
      ...details,
      _id: operation.id
    };
  }

  const details = await get({
    path: `messages/${code}/${sent.id}`
  });

  await db.put({
    ...details,
    _id: sent.id,
    type: "message",
    templateId,
    batchId
  });
  return {
    ...details,
    _id: sent.id
  };
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
        amount: amount.valueOf(),
        notice_number: notice
      }
    });
  }

  return content;
};

module.exports.createMessageContent = createMessageContent;
