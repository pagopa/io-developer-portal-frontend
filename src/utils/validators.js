import { conformToMask } from "react-text-mask";

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
