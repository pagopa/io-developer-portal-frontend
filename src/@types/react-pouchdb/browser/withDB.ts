import { ComponentClass } from "react";
import Database = PouchDB.Database;

declare module "react-pouchdb/browser" {
  type DBProps = {
    db: Database;
  };
  export function withDB<P>(
    component: ComponentClass<P>
  ): ComponentClass<P & DBProps>;
}
