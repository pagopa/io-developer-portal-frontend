import map from "lodash/map";
import template from "lodash/template";
import toPairs from "lodash/toPairs";
import zipObject from "lodash/zipObject";
import moment from "moment";

import { get, post } from "./api";
import { upsert } from "./db";

import { CONSTANTS } from "./constants";
import Database = PouchDB.Database;
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

export function isProblemJson<T>(res: T | ProblemJson): res is ProblemJson {
  return (res as ProblemJson).status !== undefined;
}

interface CreatedMessageWithoutContentCollection {
  items: ReadonlyArray<CreatedMessageWithoutContent>;
}

interface PaginationResponse {
  page_size: number;
  next: string;
}

interface PaginatedCreatedMessageWithoutContentCollection
  extends CreatedMessageWithoutContentCollection,
    PaginationResponse {}

interface CreatedMessageWithoutContent {
  id: string;
  fiscal_code: string;
  time_to_live?: number;
  created_at: Timestamp;
  sender_service_id: string;
}

export async function profileGetAndPersist(params: ProfileGetAndPersistParams) {
  const { db, dbName, url, code, batchId } = params;
  const profile = await get<
    PaginatedCreatedMessageWithoutContentCollection | ProblemJson
  >({
    dbName,
    url,
    path: `profiles/${code}`
  });

  const newDoc = Object.assign(
    {
      type: "contact",
      batchId
    },
    isProblemJson(profile) // The API returns errors with shape { detail, status, title }
      ? { sender_allowed: null, status: profile.status } // Create an errored profile
      : profile
  );

  return upsert(db, code, newDoc);
}

interface MessagePostAndPersistParams {
  db: Database;
  code: string;
  content: MessageContent;
  templateId: any;
  batchId?: any;
}

type Timestamp = string;

interface MessageContent {
  subject: string;
  markdown: string;
  payment_data?: PaymentData;
  due_date?: Timestamp;
}

interface PaymentData {
  amount: number;
  notice_number: string;
  invalid_after_due_date?: boolean;
}

export interface ProblemJson {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

interface SubmitMessageForUserResponse {
  id: string;
}

export interface MessageResponseWithContent {
  message: CreatedMessageWithContent;
  notification?: MessageResponseNotificationStatus;
  status?: MessageStatusValue;
}

interface MessageResponseNotificationStatus {
  email: NotificationChannelStatusValue;
}

enum MessageStatusValue {
  ACCEPTED = "ACCEPTED",
  THROTTLED = "THROTTLED",
  FAILED = "FAILED",
  PROCESSED = "PROCESSED"
}

enum NotificationChannelStatusValue {
  SENT = "SENT",
  THROTTLED = "THROTTLED",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED"
}

interface CreatedMessageWithContent {
  id: string;
  fiscal_code: string;
  time_to_live?: number;
  created_at: Timestamp;
  content: MessageContent;
  sender_service_id: string;
}

interface DetailsOnError {
  message: {
    created_at: Timestamp;
    fiscal_code: string;
  } & ProblemJson;
}

export interface MessagePostAndPersistFail extends DetailsOnError {
  _id: string;
}

export interface MessagePostAndPersistSuccess
  extends MessageResponseWithContent {
  _id: string;
}

export type MessagePostAndPersistResult =
  | MessagePostAndPersistSuccess
  | MessagePostAndPersistFail;

export async function messagePostAndPersist({
  db,
  code,
  content,
  templateId,
  batchId = ""
}: MessagePostAndPersistParams): Promise<
  MessagePostAndPersistSuccess | MessagePostAndPersistFail
> {
  const sent = await post<SubmitMessageForUserResponse | ProblemJson>({
    path: `messages/${code}`,
    options: {
      body: {
        time_to_live: 3600,
        content
      }
    }
  });

  // The API returns errors with shape { detail, status, title }
  if (isProblemJson(sent)) {
    const detailsOnError: DetailsOnError = {
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

  const details = await get<MessageResponseWithContent>({
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

  return toPairs(CSV).reduce(
    (previousValues, keyIndexTuple) => {
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

const interpolateAmount = (amountString: string) => {
  if (!!amountString) {
    // Amount is in Euro `cents`
    const amount = Number(amountString) / 100;
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
  const messageValues = getMessageValues(row);

  const values = {
    ...messageValues,
    value: interpolateAmount(messageValues.amount)
  };

  return compiled(values);
}

export default {
  profileGetAndPersist,
  createMessageContent,
  getMessageValues,
  interpolateMarkdown
};
