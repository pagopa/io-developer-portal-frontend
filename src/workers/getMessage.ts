import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";
PouchDB.plugin(find);

import Batch from "batch";

import { get } from "../utils/api";
import { upsert } from "../utils/db";

import { MessageResponseWithContent } from "../../generated/definitions/commons/MessageResponseWithContent";
import { ProblemJson } from "../../generated/definitions/commons/ProblemJson";
import { MessageDocument } from "../utils/operations";

interface DataType {
  dbName: string;
  url: string;
}

const worker: Worker = (self as unknown) as Worker;

worker.addEventListener("message", async e => {
  if (!e) {
    return;
  }

  const { dbName, url }: DataType = e.data;

  const db = new PouchDB<MessageDocument>(dbName);

  const messages = await db.find({
    selector: {
      type: "message",
      status: {
        $nin: ["FAILED", "NOTSENT"]
      },
      retrieved: {
        $ne: true
      }
    }
  });

  const batch = new Batch();
  batch.concurrency(1);

  messages.docs.forEach(entry => {
    batch.push(async done => {
      const { id, fiscal_code } = entry.message;
      const path = `messages/${fiscal_code}/${id}`;
      const message = await get<MessageResponseWithContent | ProblemJson>({
        dbName,
        url,
        path
      });

      if (message.hasOwnProperty("statusCode")) {
        // TODO: is it correct? Shouldn't it be `status`?
        // API returned an error
        console.error(id);
      } else {
        await upsert(db, entry._id, {
          ...entry,
          ...message,
          retrieved: true
        });
      }

      done();
    });
  });

  // Actually startes the batch
  // tslint:disable-next-line:no-any
  batch.end((err: any) => {
    if (!err) {
      worker.postMessage({
        ...e.data,
        completed: true
      });
    }
  });
});
