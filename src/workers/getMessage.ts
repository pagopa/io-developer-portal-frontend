import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";
PouchDB.plugin(find);

import Batch from "batch";

import { get } from "../utils/api";
import { upsert } from "../utils/db";

self.addEventListener("message", async e => {
  if (!e) {
    return;
  }

  const { dbName, url } = e.data;

  const db: any = new PouchDB(dbName);

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
  batch.on("progress", () => {});

  messages.docs.forEach((entry: any) => {
    batch.push(async (done: () => never) => {
      const { id, fiscal_code } = entry.message;
      const path = `messages/${fiscal_code}/${id}`;
      const message = await get({ dbName, url, path });

      if (message.statusCode) {
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
  batch.end((err: any) => {
    if (!err) {
      postMessage(
        {
          ...e.data,
          completed: true
        },
        "*"
      ); // TODO: set the proper targetOrigin
    }
  });
});
