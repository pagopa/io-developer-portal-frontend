import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";
PouchDB.plugin(find);

import Batch from "batch";

import { profileGetAndPersist } from "../utils/operations";

self.addEventListener("message", async e => {
  if (!e) return;

  const { action, dbName, url, batchId, results } = e.data;

  const db = new PouchDB(dbName);

  const batch = new Batch();
  batch.concurrency(1);
  batch.on("progress", e => {});

  const promises = [];
  results.forEach(async ([result]) => {
    batch.push(async done => {
      try {
        const operation = await profileGetAndPersist({
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
  batch.end((err, data) => {
    if (!err) {
      postMessage({
        ...e.data,
        completed: true
      }, undefined);  // TODO: set the proper targetOrigin
    }
  });
});
