import toPairs from "lodash/toPairs";
import { conformToMask } from "react-text-mask";

import { CONSTANTS, LIMITS } from "./constants";
const { CSV, CSV_HEADERS } = CONSTANTS;

export const isMaskValid = (value: string, mask: ReadonlyArray<RegExp>) => {
  return (
    conformToMask(value, [...mask], undefined).conformedValue.indexOf("_") ===
    -1
  );
};

export const isValueRangeValid = (
  value: any,
  [min, max]: Readonly<[number, number]>
) => {
  return value >= min && value <= max;
};

export const isLengthValid = (
  value: string,
  [min, max]: Readonly<[number, number]>
) => {
  return isValueRangeValid(value.length, [min, max]);
};

export const areHeadersValid = (value: ReadonlyArray<any>) => {
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
