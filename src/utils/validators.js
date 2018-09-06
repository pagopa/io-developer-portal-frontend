import { conformToMask } from "react-text-mask";

const LIMITS = {
  SUBJECT: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L246
    MIN: 10,
    MAX: 120
  },
  MARKDOWN: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L260
    MIN: 80,
    MAX: 10000
  },
  CODE: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L234
    MIN: 16,
    MAX: 16
  },
  AMOUNT: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L129
    MIN: 1,
    MAX: 9999999999
  },
  NOTICE: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L120
    MIN: 18,
    MAX: 18
  }
};

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
