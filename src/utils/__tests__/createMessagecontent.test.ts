import { createMessageContent } from "../operations";

const messageData = {
  message: {
    subject: "A test subject",
    markdown:
      "This is the markdown, it should be at least 80 characters long otherwise you'll got an error."
  },
  dueDate: "22/10/2021, 18:00",
  amount: "123",
  notice: "000111222333444555",
  dueDateFormat: "DD/MM/YYYY, HH:mm",
  invalidAfterDueDate: true
};

const mockMessageData = jest.fn().mockImplementation(() => {
  return messageData;
});
describe("Create Message Content", () => {
  it("should create a message with payment_data", () => {
    const data = mockMessageData();
    const res = createMessageContent(data);
    expect(res).not.toBeNull();
    expect(res).toEqual({
      markdown:
        "This is the markdown, it should be at least 80 characters long otherwise you'll got an error.",
      subject: "A test subject",
      due_date: new Date("2021-10-22T16:00:00.000Z"),
      payment_data: {
        amount: 123,
        notice_number: "000111222333444555",
        invalid_after_due_date: true
      }
    });
  });
  it("should create a message without payment_data", () => {
    const data = mockMessageData.mockImplementationOnce(() => ({
      message: {
        subject: "A test subject",
        markdown:
          "This is the markdown, it should be at least 80 characters long otherwise you'll got an error."
      },
      dueDateFormat: "DD/MM/YYYY, HH:mm"
    }))();
    const res = createMessageContent(data);
    expect(res).not.toBeNull();
    expect(res).toEqual({
      markdown:
        "This is the markdown, it should be at least 80 characters long otherwise you'll got an error.",
      subject: "A test subject",
      due_date: undefined
    });
  });
  it("should throw 'Wrong parameters format' when subject is lesser than 10 characters", () => {
    const data = {
      ...messageData,
      message: {
        subject: "Errato",
        markdown:
          "This is the markdown, it should be at least 80 characters long otherwise you'll got an error."
      }
    };

    expect(() => createMessageContent(data)).toThrowError(
      "Wrong parameters format"
    );
  });
  // tslint:disable-next-line: no-identical-functions
  it("should throw 'Wrong parameters format' when message is lesser than 80 characters", () => {
    const data = {
      ...messageData,
      message: {
        subject: "A test subject",
        markdown: "This is the markdown, it lesser than 80 characters long."
      }
    };

    expect(() => createMessageContent(data)).toThrowError(
      "Wrong parameters format"
    );
  });
});
