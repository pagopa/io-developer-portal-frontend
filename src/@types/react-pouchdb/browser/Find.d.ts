declare module "react-pouchdb/browser" {
  import { Component, ReactElement } from "react";
  import Database = PouchDB.Database;

  type FindOwnProps<T> = {
    db?: string | Database;
    selector: { [key: string]: any };
    sort?: ReadonlyArray<any>;
    limit?: number;
    skip?: number;
    render: ({
      db,
      docs
    }: {
      db: string | Database;
      docs: ReadonlyArray<T>;
    }) => ReactElement | null;
  };
  export class Find<T = any> extends Component<FindOwnProps<T>> {}
}
