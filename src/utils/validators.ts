import { right } from "fp-ts/lib/Either";
import { FiscalCode, PatternString } from "italia-ts-commons/lib/strings";

import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";

import * as ts from "io-ts";

import { WithinRangeInteger } from "italia-ts-commons/lib/numbers";
import { EmailString, NonEmptyString } from "italia-ts-commons/lib/strings";
import { ValidUrl } from "italia-ts-commons/lib/url";

import toPairs from "lodash/toPairs";
import { conformToMask } from "react-text-mask";

import { OrganizationFiscalCode } from "../../generated/definitions/backend/OrganizationFiscalCode";
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

type PhoneCheck = ts.TypeOf<typeof NonEmptyString>;
export const PhoneCheck = new ts.Type<string, string, unknown>(
  "PhoneCheck",
  ts.string.is,
  (u, c) =>
    ts.string.validate(u, c).chain(s =>
      // tslint:disable-next-line: prettier
      new RegExp("^(\\+)?([0-9][\\s\\/\\.\\-]?)+$", "g").test(s)
        ? ts.success(s)
        : ts.failure(u, c, "Inserisci un telefono valido.")
    ),
  String
);

const isUrl = (v: ts.mixed): v is ValidUrl =>
  // tslint:disable-next-line: no-any
  ts.object.is(v) && ts.string.is((v as any).href);

export const UrlFromStringV2 = new ts.Type<ValidUrl, string>(
  "UrlFromStringV2",
  isUrl,
  (v, c) =>
    isUrl(v)
      ? ts.success(v)
      : ts.string.validate(v, c).chain(s => {
          try {
            const d = new URL(s);
            // we can safely use url.href in calling methods
            return !d.href ? ts.failure(s, c) : ts.success(d as ValidUrl);
          } catch (e) {
            return ts.failure(s, c);
          }
        }),
  a => a.toString()
);

export type UrlFromStringV2 = ts.TypeOf<typeof UrlFromStringV2>;

export type InputValue = string | boolean | number | readonly string[];

export const CIDRWithRequiredSubnetMask = PatternString(
  "^([0-9]{1,3}[.]){3}[0-9]{1,3}(/([0-9]|[1-2][0-9]|3[0-2]))$"
);
export type CIDRWithRequiredSubnetMask = ts.TypeOf<
  typeof CIDRWithRequiredSubnetMask
>;

export const checkValue = (
  prop: keyof ServiceMetadata | keyof Service,
  value: InputValue
): ts.Validation<InputValue | string | ValidUrl> => {
  switch (prop) {
    case "app_android":
    case "app_ios":
    case "support_url":
    case "tos_url":
    case "web_url": {
      return value ? UrlFromStringV2.decode(value) : right(value);
    }
    case "authorized_recipients": {
      return ts.readonlyArray(FiscalCode).decode(value);
    }
    case "authorized_cidrs": {
      return ts.readonlyArray(CIDRWithRequiredSubnetMask).decode(value);
    }
    case "description": {
      return NonEmptyString.decode(value);
    }
    case "max_allowed_payment_amount": {
      return WithinRangeInteger(0, 10000000000).decode(value);
    }
    case "organization_fiscal_code": {
      return OrganizationFiscalCode.decode(value);
    }
    case "pec":
    case "email": {
      return value ? EmailString.decode(value) : right(value);
    }
    case "phone": {
      return value ? PhoneCheck.decode(value) : right(value);
    }
    case "privacy_url": {
      return UrlFromStringV2.decode(value);
    }
    default: {
      // All other fields are optional as NonEmptyString
      return value ? NonEmptyString.decode(value) : right(value);
    }
  }
};
