const tryAndPut = (db, doc) => {
  return db.put(doc).then(
    res => {
      return {
        updated: true,
        rev: res.rev,
        id: doc._id
      };
    },
    err => {
      if (err.status !== 409) {
        throw err;
      }
      return upsert(db, doc._id, doc);
    }
  );
};

const upsert = (db, docId, newDoc) => {
  if (typeof docId !== "string") {
    throw new Error("doc id is required");
  }

  return db
    .get(docId)
    .catch(err => {
      if (err.status !== 404) {
        throw err;
      }
      return {};
    })
    .then(doc => {
      // the user might change the _rev, so save it for posterity
      const docRev = doc._rev;

      // users aren't allowed to modify these values,
      // so reset them here
      newDoc._id = docId;
      newDoc._rev = docRev;
      return tryAndPut(db, newDoc);
    });
};

module.exports.upsert = upsert;
