import { Component } from "react";

declare module "react-pouchdb/browser" {
  type PouchDBOwnProps = {
    name: string;
    maxListeners?: number;
    [key: string]: any;
  };

  export class PouchDB<P, S> extends Component<PouchDBOwnProps> {}
}
