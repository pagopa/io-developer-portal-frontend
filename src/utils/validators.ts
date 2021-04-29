import toPairs from "lodash/toPairs";
import { conformToMask } from "react-text-mask";
// Lorenzo: Qui ho i vari tipi che posso usare
import * as ts from "io-ts";
import { Option, some, none } from 'fp-ts/lib/Option';
import { ValidUrl, UrlFromString } from 'italia-ts-commons/lib/url';
import { NonEmptyString, EmailString, IEmailStringTag, INonEmptyStringTag, IPatternStringTag } from "italia-ts-commons/lib/strings";

import { CONSTANTS, LIMITS } from "./constants";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { OrganizationFiscalCode } from "../../generated/definitions/backend/OrganizationFiscalCode";
import { CIDR } from "../../generated/definitions/api/CIDR";
import * as url from 'url';

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

const isUrl = (v: ts.mixed): v is ValidUrl =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ts.object.is(v) && ts.string.is((v as any).href);

export const UrlFromStringV2 = new ts.Type<ValidUrl, string>(
  "UrlFromStringV2",
  isUrl,
  (v, c) =>
    isUrl(v)
      ? ts.success(v)
      : ts.string.validate(v, c).chain(s => {
        try {
          const d = new URL(s)
          console.log('D', d)
          // we can safely use url.href in calling methods
          return !d.href ? ts.failure(s, c) : ts.success(d as ValidUrl);
        }
        catch(e){
          console.error('E', e)
          return ts.failure(s, c)
        }
      }),
  a => a.toString()
);

export type UrlFromStringV2 = ts.TypeOf<typeof UrlFromStringV2>;

export type FieldsValidatorType =
  ts.Type<string, string, unknown>
  | ts.Type<ValidUrl, string, unknown>
  | ts.Type<string & IEmailStringTag, string, unknown>
  | ts.Type<string & INonEmptyStringTag, string & INonEmptyStringTag, unknown>
  | ts.Type<string & IPatternStringTag<"^[0-9]{11}$">, string & IPatternStringTag<"^[0-9]{11}$">, unknown>
  | ts.ReadonlyArrayC<ts.Type<string & IPatternStringTag<"^([0-9]{1,3}[.]){3}[0-9]{1,3}(/([0-9]|[1-2][0-9]|3[0-2]))?$">, string & IPatternStringTag<"^([0-9]{1,3}[.]){3}[0-9]{1,3}(/([0-9]|[1-2][0-9]|3[0-2]))?$">, unknown>>

export const getValidator = (prop: keyof ServiceMetadata | keyof Service): Option<FieldsValidatorType> => {
    switch(prop) {
      case 'phone': {
        return some(PhoneCheck)
      }
      case 'pec':
      case 'email': {
        return some(EmailString)
      }
      case 'web_url':
      case 'tos_url':
      case 'app_android':
      case 'app_ios':
      case 'privacy_url':
      case 'support_url': {
        return some(UrlFromStringV2)
      }
      case 'authorized_cidrs': {
        return some(ts.readonlyArray(CIDR))
      }
      case 'organization_fiscal_code': {
        return some(OrganizationFiscalCode)
      }
      default: {
        return some(NonEmptyString)
      }
    }
  }