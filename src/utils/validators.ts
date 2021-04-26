import toPairs from "lodash/toPairs";
import { conformToMask } from "react-text-mask";
// Lorenzo: Qui ho i vari tipi che posso usare
import * as ts from "io-ts";
import { NonEmptyString, FiscalCode } from "italia-ts-commons/lib/strings";

import { CONSTANTS, LIMITS } from "./constants";
const { CSV, CSV_HEADERS } = CONSTANTS;

export const isMaskValid = (value: string, mask: ReadonlyArray<RegExp>) => {
  return (
    conformToMask(value, [...mask], undefined).conformedValue.indexOf("_") ===
    -1
  );
};

export const isValueRangeValid = (
  value: number,
  // tslint:disable-next-line:readonly-array
  [min, max]: Readonly<[number, number]>
) => {
  return value >= min && value <= max;
};

export const isLengthValid = (
  value: string,
  // tslint:disable-next-line:readonly-array
  [min, max]: Readonly<[number, number]>
) => {
  return isValueRangeValid(value.length, [min, max]);
};

export const areHeadersValid = (value: ReadonlyArray<string>) => {
  if (!value.length) {
    return false;
  }

  const keyIndexTuples = toPairs(CSV);
  if (value.length !== keyIndexTuples.length) {
    return false;
  }

  const isValid = keyIndexTuples.map((keyIndex, i) => {
    const [key, index] = keyIndex;
    if (index !== i) {
      return false;
    }
    if (CSV_HEADERS[key] !== value[index]) {
      return false;
    }

    return true;
  });

  return !isValid.includes(false);
};

export default {
  LIMITS,
  isMaskValid,
  isLengthValid,
  isValueRangeValid,
  areHeadersValid
};

// Lorenzo: Provo a definirmi un custom message
type FiscalCodeCheck = ts.TypeOf<typeof FiscalCode>;
export const FiscalCodeCheck = new ts.Type<string, string, unknown>(
  "FiscalCode",
  ts.string.is,
  (u, c) =>
    ts.string
      .validate(u, c)
      .chain((s) =>
        new RegExp("^[0-9]{11}$").test(s)
          ? ts.success(s)
          : ts.failure(
              u,
              c,
              "Il codice fiscale è errato!"
            )
      ),
  String
);


type URLCheck = ts.TypeOf<typeof NonEmptyString>;
export const URLCheck = new ts.Type<string, string, unknown>(
  "URLCheck",
  ts.string.is,
  (u, c) =>
    ts.string
      .validate(u, c)
      .chain((s) =>
        new RegExp("^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$").test(s)
          ? ts.success(s)
          : ts.failure(
              u,
              c,
              "L'indirizzo del sito web è malformato!"
            )
      ),
  String
);

type PhoneCheck = ts.TypeOf<typeof NonEmptyString>;
export const PhoneCheck = new ts.Type<string, string, unknown>(
  "PhoneCheck",
  ts.string.is,
  (u, c) =>
    ts.string
      .validate(u, c)
      .chain((s) =>
        new RegExp("[0-9]", "g").test(s)
          ? ts.success(s)
          : ts.failure(
              u,
              c,
              "Inserisci un telefono valido."
            )
      ),
  String
);

type MailCheck = ts.TypeOf<typeof NonEmptyString>;
export const MailCheck = new ts.Type<string, string, unknown>(
  "MailCheck",
  ts.string.is,
  (u, c) =>
    ts.string
      .validate(u, c)
      .chain((s) =>
        new RegExp('^\S+@\S+$').test(s)
          ? ts.success(s)
          : ts.failure(
              u,
              c,
              "Inserisci una mail valida."
            )
      ),
  String
);