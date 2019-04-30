const tryAndPut = (db: any, doc: any) => {
  return db.put(doc).then(
    (res: any) => {
      return {
        updated: true,
        rev: res.rev,
        id: doc._id
      };
    },
    (err: any) => {
      if (err.status !== 409) {
        throw err;
      }
      return upsert(db, doc._id, doc);
    }
  );
};

export function upsert(db: any, docId: string | undefined, newDoc: any) {
  if (typeof docId !== "string") {
    throw new Error("doc id is required");
  }

  return db
    .get(docId)
    .catch((err: any) => {
      if (err.status !== 404) {
        throw err;
      }
      return {};
    })
    .then((doc: any) => {
      // the user might change the _rev, so save it for posterity
      const docRev = doc._rev;

      return tryAndPut(db, {
        ...newDoc,
        // users aren't allowed to modify these values,
        // so reset them here
        _id: docId,
        _rev: docRev
      });
    });
}

export default { upsert };
