import moment from "moment";
import template from "lodash/template";
import toPairs from "lodash/toPairs";
import zipObject from "lodash/zipObject";
import map from "lodash/map";

import { get, post } from "./api";
import { upsert } from "./db";

import { CONSTANTS } from "./constants";
const { CSV, CSV_HEADERS } = CONSTANTS;

const templateSettings = { interpolate: /{{([\s\S]+?)}}/g };

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  currencyDisplay: "symbol",
  minimumFractionDigits: 2,
  useGrouping: false
});

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

const createMessageContent = ({
  message,
  dueDate,
  amount,
  notice,
  dueDateFormat
}) => {
  let content = {
    subject: message.subject,
    markdown: message.markdown,
    due_date: dueDate && moment(dueDate, dueDateFormat).toISOString()
  };

  if (amount && notice) {
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

const getMessageValues = row => {
  const values = {};

  if (!row) {
    return values;
  }

  const keyIndexTuples = toPairs(CSV);
  keyIndexTuples.forEach(keyIndex => {
    const [key, index] = keyIndex;
    values[CSV_HEADERS[key]] = row[index];
  });

  return values;
};

module.exports.getMessageValues = getMessageValues;

const interpolateAmount = string => {
  if (!!string) {
    const formatParts = currencyFormatter.formatToParts(string);
    /* `formatParts` is now;
    [
      {
        "type": "integer",
        "value": "1"
      },
      ...
    ]
    */

    const parts = zipObject(
      map(formatParts, "type"),
      map(formatParts, "value")
    );
    /* `parts` is now
      {
        "integer": "1",
        "decimal": ",",
        "fraction": "23",
        "literal": " ",
        "currency": "€"
      }
    */
    const { integer, fraction, currency} = parts;
    return `${integer}.${fraction}${currency}`;
  }

  return "";
};

const interpolateMarkdown = (markdown, row) => {
  const compiled = template(markdown, templateSettings);
  const values = getMessageValues(row);

  values.amount = interpolateAmount(values.amount);

  return compiled(values);
};

module.exports.interpolateMarkdown = interpolateMarkdown;
