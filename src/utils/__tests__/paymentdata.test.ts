import { PaymentData } from "../../../generated/definitions/commons/PaymentData";

describe("PaymentData Decode", () => {
  it("should return an object with payee", () => {
    const p = {
      amount: 122,
      invalid_after_due_date: true,
      notice_number: "012345678912345678",
      payee: {
        fiscal_code: "01234567890"
      }
    };
    const decoded = PaymentData.decode(p);

    expect(decoded.value).toEqual({
      amount: 122,
      invalid_after_due_date: true,
      notice_number: "012345678912345678",
      payee: {
        fiscal_code: "01234567890"
      }
    });
  });
  it("should return an object also without payee", () => {
    const p = {
      amount: 122,
      invalid_after_due_date: false,
      notice_number: "012345678912345678"
    };
    const decoded = PaymentData.decode(p);
    expect(decoded.isRight()).toBe(true);
    expect(decoded.value).toEqual({
      amount: 122,
      invalid_after_due_date: false,
      notice_number: "012345678912345678"
    });
  });
});
