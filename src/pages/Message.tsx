import React, { ChangeEvent, Component, Fragment } from "react";

import { findDOMNode } from "react-dom";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Find, withDB } from "react-pouchdb/browser";

import { parse } from "papaparse";

import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row
} from "design-react-kit";

import moment, { Moment } from "moment";
import compose from "recompose/compose";

import FaSpinner from "react-icons/lib/fa/spinner";

import ContactsList from "../components/contacts/ContactsList";
import MessageMetadataEditor from "../components/messages/MessageMetadataEditor";
import MessagePreview from "../components/messages/MessagePreview";

import { getUrl } from "../utils/api";
import { LIMITS } from "../utils/constants";
import { noticeMask } from "../utils/masks";
import {
  createMessageContent,
  messagePostAndPersist,
  MessagePostAndPersistResult
} from "../utils/operations";
import { isMaskValid, isValueRangeValid } from "../utils/validators";
const { AMOUNT, CODE } = LIMITS;

import { GetProfileWorker } from "../workers/";
import { ContactDocument } from "../workers/getProfile";

import { RouteComponentProps } from "react-router";
import "./Message.css";
import Database = PouchDB.Database;

export interface TemplateDocument {
  type: "template";
  subject: string;
  markdown: string;
}

export interface BatchDocument {
  type: "batch";
  templateId: string;
  created_at: string;
}

type OwnProps = {
  db: Database<TemplateDocument | BatchDocument | ContactDocument>;
  dbName: string;
};
type Props = RouteComponentProps<
  {},
  {},
  { templateId: string; type: "list" | "single" }
> &
  WithNamespaces &
  OwnProps;

type MessageState = {
  list: string;
  contacts: ReadonlyArray<ReadonlyArray<string>>;
  file?: File;
  batch: string;
  selected: string;
  dueDate: Moment | null;
  amount: string;
  notice: string;
  invalidAfterDueDate: boolean;
  recipientOpen: boolean;
  sent: boolean;
  progress: boolean;
};

class Message extends Component<Props, MessageState> {
  public initialState: MessageState = {
    list: "",
    contacts: [],
    batch: "",
    selected: "",
    dueDate: null,
    amount: "",
    notice: "",
    invalidAfterDueDate: false,
    recipientOpen: false,
    sent: false,
    progress: false
  };

  public state: MessageState = {
    list: this.initialState.list,
    contacts: this.initialState.contacts,
    file: this.initialState.file,
    batch: this.initialState.batch,
    selected: this.initialState.selected,
    dueDate: this.initialState.dueDate,
    amount: this.initialState.amount,
    notice: this.initialState.notice,
    invalidAfterDueDate: this.initialState.invalidAfterDueDate,
    recipientOpen: this.initialState.recipientOpen,
    sent: this.initialState.sent,
    progress: this.initialState.progress
  };

  public fileInput = React.createRef<Input>();

  public componentDidMount() {
    GetProfileWorker.addEventListener("message", ({ data }) => {
      this.setState({
        progress: this.initialState.progress,
        batch: data.batchId
      });
    });
  }

  public onToggleRecipientOpen = () => {
    this.setState(prevState => {
      return {
        recipientOpen: !prevState.recipientOpen
      };
    });
  };

  public onContactSelect = (selected: string) => {
    this.setState({ selected });
  };

  public onChangeList = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      batch: this.initialState.batch,
      contacts: this.initialState.contacts,
      file: this.initialState.file,
      list: value
    });
  };

  public onTriggerUpload = () => {
    const element = findDOMNode(this.fileInput.current);
    if (element) {
      (element as HTMLInputElement).click();
    }
  };

  public onFileUpdate = ({
    target: { files }
  }: ChangeEvent<HTMLInputElement>) => {
    if (!files || !files[0]) {
      return;
    }
    parse(files[0], {
      skipEmptyLines: true,
      error: error => {
        console.error(error);
      },
      complete: results => {
        // data is an array of rows.
        // If `header` is false, rows are arrays;
        // otherwise they are objects of data keyed by the field name

        const filtered: ReadonlyArray<string> = results.data.reduce(
          (
            previousLinesValues: ReadonlyArray<string>,
            currentLine: ReadonlyArray<string>
          ) => [
            ...previousLinesValues,
            ...currentLine.reduce(
              (previousValues: ReadonlyArray<string>, currentValue: string) =>
                previousValues.concat(
                  // TODO Test it against validator (will be validated against API anyway)
                  currentValue.length === CODE.MAX ? currentValue : []
                ),
              []
            )
          ],
          []
        );

        this.setState({
          batch: this.initialState.batch,
          file: files[0],
          list: filtered.join("\n"),
          recipientOpen: true,
          contacts: results.data
        });
      }
    });
  };

  public onChangeDueDate = (date: moment.Moment) => {
    this.setState({ dueDate: date });
  };

  public onChangeNotice = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({ notice: value });
  };

  public onChangeAmount = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({ amount: value && Number(value).toString() });
  };

  public onChangeInvalidAfterDueDate = ({
    target: { checked }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      invalidAfterDueDate: checked
    });
  };

  public onReset = (inputGroup: "dueDate" | "notice" | "amount") => {
    switch (inputGroup) {
      case "dueDate":
        this.setState({ dueDate: this.initialState.dueDate });
        break;
      case "notice":
        this.setState({ notice: this.initialState.notice });
        break;
      case "amount":
        this.setState({ amount: this.initialState.amount });
        break;
    }
  };

  public onSaveContacts = () => {
    const { list } = this.state;
    const {
      db,
      dbName,
      location: {
        state: { templateId }
      }
    } = this.props;

    parse(list, {
      skipEmptyLines: true,
      error: error => {
        console.error(error);
      },
      complete: async results => {
        const batch = await db.post({
          type: "batch",
          templateId,
          created_at: moment().toISOString()
        });

        this.setState({
          progress: true,
          recipientOpen: true,
          contacts: results.data
        });
        GetProfileWorker.postMessage({
          action: "getProfile",
          dbName,
          url: getUrl(),
          batchId: batch.id,
          results: results.data
        });
      }
    });
  };

  public onMessageSubmit = async () => {
    this.setState({
      sent: true
    });

    const {
      batch,
      selected,
      dueDate,
      notice,
      amount,
      invalidAfterDueDate
    } = this.state;
    const {
      db,
      t,
      location: {
        state: { templateId }
      }
    } = this.props;

    const messages = await (db as Database<TemplateDocument>).find({
      selector: { type: "template", _id: { $eq: templateId } }
    });
    const message = messages.docs[0];

    const content = createMessageContent({
      message,
      dueDate,
      amount,
      notice,
      dueDateFormat: t("format:date"),
      invalidAfterDueDate
    });

    const result = !batch
      ? [
          await messagePostAndPersist({
            db,
            code: selected,
            content,
            templateId,
            batchId: batch
          })
        ]
      : await Promise.all(
          (await (db as Database<ContactDocument>).find({
            selector: {
              type: "contact",
              batchId: batch
            }
          })).docs.reduce(
            (
              prevPromisesArray: ReadonlyArray<
                Promise<MessagePostAndPersistResult>
              >,
              doc
            ) => {
              return [
                ...prevPromisesArray,
                messagePostAndPersist({
                  db,
                  code: doc._id,
                  content,
                  templateId,
                  batchId: batch
                })
              ];
            },
            []
          )
        );

    this.goHome({ result });
  };

  public goHome = ({
    result
  }: {
    result: ReadonlyArray<MessagePostAndPersistResult>;
  }) => {
    const { history } = this.props;
    const location = {
      pathname: "/",
      state: result
    };
    history.push(location);
  };

  public renderAccordion = () => {
    const {
      list,
      contacts,
      file,
      batch,
      selected,
      recipientOpen,
      progress
    } = this.state;
    const {
      location: {
        state: { type }
      }
    } = this.props;
    const { t } = this.props;
    return (
      <Accordion className="border-0">
        <AccordionHeader
          className="border-0 p-2 text-decoration-none font-weight-normal"
          active={recipientOpen}
          onToggle={() => this.onToggleRecipientOpen()}
        >
          <span className="text-uppercase text-secondary">
            {type === "single" ? t("recipient") : t("recipients")}
          </span>
          {(list || selected) && (
            <Badge
              color=""
              className="font-weight-normal ml-3 bg-custom-pale-blue color-custom-denim-blue"
            >
              {(() => {
                if (type === "single") {
                  return selected;
                }

                return (
                  <span>
                    {file && file.name
                      ? `${file.name} (${contacts.length})`
                      : contacts.length}
                  </span>
                );
              })()}
            </Badge>
          )}
        </AccordionHeader>
        <AccordionBody className="p-0" active={recipientOpen}>
          {(() => {
            if (type === "single") {
              return (
                <Fragment>
                  <div className="message--contacts-list mb-4">
                    <Find<ContactDocument>
                      selector={{
                        type: "contact"
                      }}
                      sort={["_id"]}
                      render={({ docs }) => (
                        <ContactsList
                          docs={docs}
                          selected={selected}
                          onContactSelect={this.onContactSelect}
                        />
                      )}
                    />
                  </div>
                </Fragment>
              );
            }

            return (
              <Fragment>
                <Row>
                  <Col>
                    <Card>
                      <Input
                        className="flex-1 h-100 border-0 shadow-none"
                        type="textarea"
                        value={list}
                        onChange={this.onChangeList}
                      />
                    </Card>
                  </Col>
                </Row>
                {list && !batch && (
                  <Row>
                    <Col>
                      <Button
                        className="mt-3"
                        block={true}
                        color="primary"
                        onClick={this.onSaveContacts}
                        disabled={progress}
                      >
                        {progress ? <FaSpinner /> : t("save")}
                      </Button>
                    </Col>
                    <Col />
                  </Row>
                )}
                {batch && (
                  <div className="message--contacts-list mt-4">
                    <Find<ContactDocument>
                      selector={{
                        type: "contact",
                        batchId: batch
                      }}
                      sort={["_id"]}
                      render={({ docs }) => (
                        <ContactsList docs={docs} selected={selected} />
                      )}
                    />
                  </div>
                )}
              </Fragment>
            );
          })()}
        </AccordionBody>
      </Accordion>
    );
  };

  public renderSubmitButton = () => {
    const { batch, selected, dueDate, notice, amount, sent } = this.state;
    const {
      location: {
        state: { type }
      }
    } = this.props;
    const { t } = this.props;
    const isNoticeValid = isMaskValid(notice, noticeMask);
    const isAmountValid = isValueRangeValid(Number(amount), [
      AMOUNT.MIN,
      AMOUNT.MAX
    ]);
    const isValid: ReadonlyArray<boolean> = Array()
      .concat(dueDate ? moment(dueDate).isValid() : [])
      .concat(notice || amount ? [isNoticeValid, isAmountValid] : []);

    if (type === "single") {
      return (
        <Button
          className="mt-3 pl-5 pr-5"
          color="primary"
          disabled={isValid.concat(!!selected).includes(false)}
          onClick={this.onMessageSubmit}
        >
          {t("send")}
        </Button>
      );
    }

    return (
      <Button
        className="mt-3 pl-5 pr-5"
        color="primary"
        disabled={isValid.concat(!!batch).includes(false) || sent}
        onClick={this.onMessageSubmit}
      >
        {sent ? <FaSpinner /> : t("send_batch")}
      </Button>
    );
  };

  public render() {
    const { dueDate, notice, amount, invalidAfterDueDate } = this.state;
    const {
      location: {
        state: { type, templateId }
      }
    } = this.props;
    const { t } = this.props;

    const isNoticeValid = isMaskValid(notice, noticeMask);
    const isAmountValid = isValueRangeValid(Number(amount), [
      AMOUNT.MIN,
      AMOUNT.MAX
    ]);

    return (
      <section>
        {(() => {
          return (
            <Fragment>
              <Row className="mb-5">
                <Col>{this.renderAccordion()}</Col>
                {(() => {
                  if (type !== "single") {
                    return (
                      <Col className="col-auto border-left mb-2">
                        <header
                          className="message--recipient-upload text-uppercase text-right ml-2"
                          onClick={this.onTriggerUpload}
                        >
                          <span className="btn btn-link font-weight-bold">
                            {t("upload_file")}
                          </span>
                        </header>
                        <Input
                          className="d-none"
                          type="file"
                          ref={this.fileInput}
                          onChange={this.onFileUpdate}
                        />
                      </Col>
                    );
                  }
                })()}
              </Row>
            </Fragment>
          );
        })()}

        <div className="message--preview mb-4">
          <Find<TemplateDocument>
            selector={{
              type: "template",
              _id: { $eq: templateId }
            }}
            sort={["_id"]}
            render={({ docs }) => {
              const message = docs[0];

              if (!message) {
                return null;
              }
              return <MessagePreview message={message} />;
            }}
          />
        </div>

        <MessageMetadataEditor
          dueDate={dueDate}
          notice={notice}
          amount={amount.toString()}
          invalidAfterDueDate={invalidAfterDueDate}
          isNoticeValid={isNoticeValid}
          isAmountValid={isAmountValid}
          onChangeDueDate={this.onChangeDueDate}
          onChangeNotice={this.onChangeNotice}
          onChangeAmount={this.onChangeAmount}
          onChangeInvalidAfterDueDate={this.onChangeInvalidAfterDueDate}
          onReset={this.onReset}
        />

        {this.renderSubmitButton()}
      </section>
    );
  }
}

const enhance = compose<Props, Props>(
  withDB,
  withNamespaces("message")
);

export default enhance(Message);
