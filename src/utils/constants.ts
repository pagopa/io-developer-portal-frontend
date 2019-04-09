export const CONSTANTS = {
  CSV: {
    NAME: 0,
    SURNAME: 1,
    FISCALCODE: 2,
    SUBJECT: 3,
    MARKDOWN: 4,
    AMOUNT: 5,
    NOTICE: 6,
    DUEDATE: 7
  },
  CSV_HEADERS: {
    NAME: "name",
    SURNAME: "surname",
    FISCALCODE: "fiscal_code",
    SUBJECT: "subject",
    MARKDOWN: "markdown",
    AMOUNT: "amount",
    NOTICE: "notice_number",
    DUEDATE: "due_date"
  }
};

export const LIMITS = {
  SUBJECT: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L246
    MIN: 10,
    MAX: 119
  },
  MARKDOWN: {
    // https://github.com/teamdigitale/digital-citizenship-functions/blob/master/api/definitions.yaml#L260
    MIN: 80,
    MAX: 9999
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
