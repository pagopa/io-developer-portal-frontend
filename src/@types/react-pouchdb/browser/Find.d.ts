// tslint:disable:readonly-array
// tslint:disable:max-union-size

declare module "react-pouchdb/browser" {
  import { Component, ReactElement } from "react";
  import Database = PouchDB.Database;

  interface ConditionOperators {
    /** Match fields "less than" this one. */
    $lt?: any;

    /** Match fields "greater than" this one. */
    $gt?: any;

    /** Match fields "less than or equal to" this one. */
    $lte?: any;

    /** Match fields "greater than or equal to" this one. */
    $gte?: any;

    /** Match fields equal to this one. */
    $eq?: any;

    /** Match fields not equal to this one. */
    $ne?: any;

    /** True if the field should exist, false otherwise. */
    $exists?: boolean;

    /** One of: "null", "boolean", "number", "string", "array", or "object". */
    $type?: "null" | "boolean" | "number" | "string" | "array" | "object";

    /** The document field must exist in the list provided. */
    $in?: any[];

    /** The document field must not exist in the list provided. */
    $nin?: any[];

    /** Special condition to match the length of an array field in a document. Non-array fields cannot match this condition. */
    $size?: number;

    /**
     * Divisor and Remainder are both positive or negative integers.
     * Non-integer values result in a 404 status.
     * Matches documents where (field % Divisor == Remainder) is true, and only when the document field is an integer.
     * [divisor, remainder]
     */
    $mod?: [number, number];

    /** A regular expression pattern to match against the document field. Only matches when the field is a string value and matches the supplied regular expression. */
    $regex?: string;

    /** Matches an array value if it contains all the elements of the argument array. */
    $all?: any[];

    $elemMatch?: ConditionOperators;
  }

  interface CombinationOperators {
    /** Matches if all the selectors in the array match. */
    $and?: Selector[];

    /** Matches if any of the selectors in the array match. All selectors must use the same index. */
    $or?: Selector[];

    /** Matches if the given selector does not match. */
    $not?: Selector;

    /** Matches if none of the selectors in the array match. */
    $nor?: Selector[];
  }

  interface Selector extends CombinationOperators {
    [field: string]: Selector | Selector[] | ConditionOperators | any;

    _id?: ConditionOperators;
  }

  type ExistingDocument<Content extends {}> = Document<Content> &
    RevisionIdMeta;

  type Document<Content extends {}> = Content & IdMeta;
  interface IdMeta {
    _id: string;
  }
  interface RevisionIdMeta {
    _rev: string;
  }
  type FindOwnProps<T = {}> = {
    db?: string | Database;
    selector: Selector;
    sort?: ReadonlyArray<string | { [propName: string]: "asc" | "desc" }>;
    limit?: number;
    skip?: number;
    render: ({
      db,
      docs
    }: {
      db: string | Database;
      docs: ReadonlyArray<ExistingDocument<T>>;
    }) => ReactElement | null;
  };
  export class Find<T = any> extends Component<FindOwnProps<T>> {}
}
