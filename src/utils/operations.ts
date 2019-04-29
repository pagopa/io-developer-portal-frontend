import map from "lodash/map";
import template from "lodash/template";
import toPairs from "lodash/toPairs";
import zipObject from "lodash/zipObject";
import moment from "moment";

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

interface ProfileGetAndPersistParams {
  db: any;
  dbName?: any;
  url?: any;
  code: any;
  batchId?: any;
}

export async function profileGetAndPersist(params: ProfileGetAndPersistParams) {
  const { db, dbName, url, code, batchId } = params;
  const profile = await get({ dbName, url, path: `profiles/${code}` });

  const newDoc = Object.assign(
    {
      type: "contact",
      batchId
    },
    profile.status // The API returns errors with shape { detail, status, title }
      ? { sender_allowed: null, status: profile.status } // Create an errored profile
      : profile
  );

  return upsert(db, code, newDoc);
}

export async function messagePostAndPersist({
  db,
  code,
  content,
  templateId,
  batchId = ""
}: any) {
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
    const detailsOnError = {
      message: {
        created_at: new Date().toISOString(),
        fiscal_code: code,
        ...sent
      }
    };

    // Create an errored message
    const operation = await db.post({
      ...detailsOnError,
      type: "message",
      templateId,
      batchId,
      status: "NOTSENT"
    });

    return {
      ...detailsOnError,
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
}

export function createMessageContent({
  message,
  dueDate,
  amount,
  notice,
  dueDateFormat
}: any) {
  const content = {
    subject: message.subject,
    markdown: message.markdown,
    due_date: dueDate && moment(dueDate, dueDateFormat).toISOString()
  };

  return amount && notice
    ? {
        ...content,
        payment_data: {
          amount: amount.valueOf(),
          notice_number: notice
        }
      }
    : content;
}

export function getMessageValues(row: any) {
  if (!row) {
    return { amount: "" };
  }

  return toPairs(CSV).reduce((previousValues, keyIndexTuple) => {
      const [key, index] = keyIndexTuple;
      return {
        ...previousValues,
        [CSV_HEADERS[key]]: row[index]
      };
    },
    {
      amount: ""
    }
  );
}

const interpolateAmount = (string: string) => {
  if (!!string) {
    // Amount is in Euro `cents`
    const amount = Number(string) / 100;
    const formatParts = currencyFormatter.formatToParts(amount);
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
    const { integer, fraction, currency } = parts;
    return `${integer}.${fraction}${currency}`;
  }

  return "";
};

export function interpolateMarkdown(markdown: any, row: any) {
  const compiled = template(markdown, templateSettings);
  const values = getMessageValues(row);

  values.amount = interpolateAmount(values.amount);

  return compiled(values);
}

export default {
  profileGetAndPersist,
  createMessageContent,
  getMessageValues,
  interpolateMarkdown
};
