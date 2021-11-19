import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";
PouchDB.plugin(find);

import Batch from "batch";

import { profileGetAndPersist } from "../utils/operations";

import { Profile } from "../../generated/definitions/commons/Profile";

interface DataType {
  dbName: string;
  url: string;
  batchId: string;
  results: ReadonlyArray<ReadonlyArray<string>>;
}

export type ContactDocument = {
  type: "contact";
  batchId?: string;
} & (
  | { sender_allowed: null; status?: number }
  | { sender_allowed: null | boolean } & Profile);

const worker: Worker = (self as unknown) as Worker;

worker.addEventListener("message", async e => {
  if (!e) {
    return;
  }

  const { dbName, url, batchId, results }: DataType = e.data;

  const db = new PouchDB<ContactDocument>(dbName);

  const batch = new Batch();
  batch.concurrency(1);

  results.forEach(async ([result]) => {
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
