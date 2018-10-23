import { conformToMask } from "react-text-mask";
import toPairs from "lodash/toPairs";

import { LIMITS, CONSTANTS } from "./constants";
const { CSV, CSV_HEADERS } = CONSTANTS;

module.exports.LIMITS = LIMITS;

const isMaskValid = (value, mask) => {
  return conformToMask(value, mask).conformedValue.indexOf("_") === -1;
};

module.exports.isMaskValid = isMaskValid;

const isLengthValid = (value, [min, max]) => {
  return isValueRangeValid(value.length, [min, max]);
};

module.exports.isLengthValid = isLengthValid;

const isValueRangeValid = (value, [min, max]) => {
  return value >= min && value <= max;
};

module.exports.isValueRangeValid = isValueRangeValid;

const areHeadersValid = value => {
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

module.exports.areHeadersValid = areHeadersValid;
