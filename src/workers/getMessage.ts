import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";
PouchDB.plugin(find);

import Batch from "batch";

import { upsert } from "../utils/db";
import { get } from "../utils/api";

self.addEventListener("message", async e => {
  if (!e) return;

  const { action, dbName, url } = e.data;

  const db = new PouchDB(dbName);

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
  batch.on("progress", e => {});

  messages.docs.forEach(entry => {
    batch.push(async done => {
      const { id, fiscal_code } = entry.message;
      const path = `messages/${fiscal_code}/${id}`;
      const message = await get({ dbName, url, path });

      if (message.statusCode) {
        // API returned an error
        console.error(id);
      } else {
        const operation = await upsert(db, entry._id, {
          ...entry,
          ...message,
          retrieved: true
        });
      }

      done();
    });
  });

  // Actually startes the batch
  batch.end((err, data) => {
    if (!err) {
      postMessage({
        ...e.data,
        completed: true
      });
    }
  });
});
