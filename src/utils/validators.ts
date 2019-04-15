import { conformToMask } from "react-text-mask";
import toPairs from "lodash/toPairs";

import { LIMITS, CONSTANTS } from "./constants";
const { CSV, CSV_HEADERS } = CONSTANTS;

export const isMaskValid = (value, mask) => {
  return conformToMask(value, mask, undefined).conformedValue.indexOf("_") === -1;
};

export const isLengthValid = (value, [min, max]) => {
  return isValueRangeValid(value.length, [min, max]);
};

export const isValueRangeValid = (value, [min, max]) => {
  return value >= min && value <= max;
};

export const areHeadersValid = value => {
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

export default { LIMITS, isMaskValid, isLengthValid, isValueRangeValid, areHeadersValid }
