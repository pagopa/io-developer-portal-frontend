import Database = PouchDB.Database;

function hasRev<T>(obj: {} | T): obj is T {
  return obj.hasOwnProperty("_rev");
}

const tryAndPut = <T>(
  db: Database,
  doc: PouchDB.Core.PutDocument<T>
): Promise<{
  updated: true;
  rev: PouchDB.Core.RevisionId;
  id?: string;
}> => {
  return db.put(doc).then(
    res => {
      return {
        updated: true,
        rev: res.rev,
        id: doc._id
      };
    },
    (err: PouchDB.Core.Error) => {
      if (err.status !== 409) {
        throw err;
      }
      return upsert<T>(db, doc._id, doc);
    }
  );
};

export function upsert<T>(db: Database, docId: string | undefined, newDoc: T) {
  if (typeof docId !== "string") {
    throw new Error("doc id is required");
  }

  return db
    .get<T>(docId)
    .catch((err: PouchDB.Core.Error) => {
      if (err.status !== 404) {
        throw err;
      }
      return {};
    })
    .then(doc => {
      return tryAndPut<T>(db, {
        ...newDoc,
        // users aren't allowed to modify these values,
        // so reset them here
        _id: docId,
        _rev: hasRev(doc) ? doc._rev : undefined // the user might change the _rev, so save it for posterity
      });
    });
}

export default { upsert };
