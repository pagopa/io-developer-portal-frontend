import { ComponentClass } from "react";

declare module "react-pouchdb/browser" {
  export function withDB<P>(component: ComponentClass<P>): ComponentClass<P>;
}
