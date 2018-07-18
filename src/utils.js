import { get, post } from "./api";

const contactGetAndPersist = async ({ db, code, batchId }) => {
  let profile = await get({ path: `profiles/${code}` });

  if (profile.status) {
    // The API returns errors with shape { detail, status, title }
    // Create an errored profile
    profile = { sender_allowed: null, status: profile.status };
  }

  return db.put({
    ...profile,
    _id: code,
    type: "contact",
    batchId
  });
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

  if (sent.status) {
    // The API returns errors with shape { detail, status, title }
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
