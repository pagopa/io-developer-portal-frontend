import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";
PouchDB.plugin(find);

import Batch from "batch";

import { profileGetAndPersist } from "../utils/operations";

self.addEventListener("message", async e => {
  if (!e) {
    return;
  }

  const { dbName, url, batchId, results } = e.data;

  const db = new PouchDB<any>(dbName);

  const batch = new Batch();
  batch.concurrency(1);

  results.forEach(async ([result]: any) => {
    batch.push(async done => {
      try {
        await profileGetAndPersist({
          db,
          dbName,
          url,
          code: result,
          batchId
        });
      } catch (error) {
        console.error(error);
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
