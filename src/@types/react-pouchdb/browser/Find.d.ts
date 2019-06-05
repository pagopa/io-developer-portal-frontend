declare module "react-pouchdb/browser" {
  import { Component, ReactElement } from "react";
  import Database = PouchDB.Database;
  import ExistingDocument = PouchDB.Core.ExistingDocument;
  import FindRequest = PouchDB.Find.FindRequest;

  type FindRequestRequiredProps<T> = Pick<FindRequest<T>, "selector">;
  type FindRequestOptionalProps<T> = Pick<
    FindRequest<T>,
    "sort" | "limit" | "skip"
  >;

  type OwnProps<T> = {
    db?: string | Database<T>;
    render: ({
      db,
      docs
    }: {
      db: string | Database<T>;
      docs: ReadonlyArray<ExistingDocument<T>>;
    }) => ReactElement | null;
  };

  type Props<T> = FindRequestRequiredProps<T> &
    FindRequestOptionalProps<T> &
    OwnProps<T>;
  export class Find<T = {}> extends Component<Props<T>> {}
}
