import { createMessageContent } from "../operations";

const messageData = {
  message: {
    subject: "Questo è un messaggio di prova",
    markdown:
      "Questo è markdown, deve essere almeno di 80 caratteri altrimenti hai un errore!!"
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
  });
  it("should create a message without payment_data", () => {
    const data = mockMessageData.mockImplementationOnce(() => ({
      message: {
        subject: "Questo è un messaggio di prova",
        markdown:
          "Questo è markdown, deve essere almeno di 80 caratteri altrimenti hai un errore!!"
      },
      dueDateFormat: "DD/MM/YYYY, HH:mm"
    }))();
    const res = createMessageContent(data);
    expect(res).not.toBeNull();
  });
  it("should throw 'Wrong parameters format' when subject is lesser than 10 characters", () => {
    const data = mockMessageData.mockImplementationOnce(() => ({
      message: {
        subject: "Errato",
        markdown:
          "Questo è markdown, deve essere almeno di 80 caratteri altrimenti hai un errore!!"
      },
      dueDateFormat: "DD/MM/YYYY, HH:mm"
    }))();

    expect(() => createMessageContent(data)).toThrowError(
      "Wrong parameters format"
    );
  });
  it("should throw 'Wrong parameters format' when message is lesser than 80 characters", () => {
    const data = mockMessageData.mockImplementationOnce(() => ({
      message: {
        subject: "Questo è un messaggio di prova",
        markdown:
          "Questo è markdown, di meno di 80 caratteri e deve andare in errore!!"
      },
      dueDateFormat: "DD/MM/YYYY, HH:mm"
    }))();

    expect(() => createMessageContent(data)).toThrowError(
      "Wrong parameters format"
    );
  });
});
