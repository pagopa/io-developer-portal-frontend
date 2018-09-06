import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";

import {
  Row,
  Col,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Badge,
  Card,
  FormGroup,
  Form,
  Label,
  InputGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  Button
} from "design-react-kit";

import { withDB, Find } from "react-pouchdb/browser";

import moment from "moment";
import Papa from "papaparse";

import FaSpinner from "react-icons/lib/fa/spinner";

import MessagePreview from "../components/messages/MessagePreview";
import ContactsList from "../components/contacts/ContactsList";
import MessageMetadataEditor from "../components/messages/MessageMetadataEditor";

import {
  createMessageContent,
  profileGetAndPersist,
  messagePostAndPersist,
  isMaskValid,
  isValueRangeValid,
  LIMITS
} from "../utils/";
import { get, post, getUrl } from "../utils/api";
import { noticeMask } from "../utils/masks";
const { AMOUNT, CODE } = LIMITS;

import { GetProfileWorker } from "../workers/";

import "./Message.css";

class Message extends Component {
  initialState = {
    list: "",
    contacts: [],
    file: undefined,
    batch: "",
    selected: "",
    dueDate: undefined,
    amount: "",
    notice: "",
    recipientOpen: false,
    sent: false,
    progress: false
  };

  state = {
    list: this.initialState.list,
    contacts: this.initialState.contacts,
    file: this.initialState.file,
    batch: this.initialState.batch,
    selected: this.initialState.selected,
    dueDate: this.initialState.dueDate,
    amount: this.initialState.amount,
    notice: this.initialState.notice,
    recipientOpen: this.initialState.recipientOpen,
    sent: this.initialState.sent,
    progress: this.initialState.progress
  };

  fileInput = React.createRef();

  componentDidMount() {
    GetProfileWorker.addEventListener("message", ({ data }) => {
      this.setState({
        progress: this.initialState.progress,
        batch: data.batchId
      });
    });
  }

  onToggleRecipientOpen = selected => {
    this.setState(prevState => {
      return {
        recipientOpen: !prevState.recipientOpen
      };
    });
  };

  onContactSelect = selected => {
    this.setState({ selected });
  };

  onChangeList = ({ target: { value } }) => {
    this.setState({
      batch: this.initialState.batch,
      contacts: this.initialState.contacts,
      file: this.initialState.file,
      list: value
    });
  };

  onTriggerUpload = () => {
    const el = ReactDOM.findDOMNode(this.fileInput.current);
    el.click();
  };

  onFileUpdate = ({ target: { files } }) => {
    Papa.parse(files[0], {
      skipEmptyLines: true,
      error: (err, file, inputElem, reason) => {
        console.error(reason);
      },
      complete: (results, file) => {
        // data is an array of rows.
        // If header is false, rows are arrays;
        // otherwise they are objects of data keyed by the field name
        const filtered = [];

        results.data.map(line =>
          line.map(value => {
            // TODO Test it against validator (will be validated against API anyway)
            if (value.length === CODE.MAX) {
              filtered.push(value);
            }
          })
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

  onChangeDueDate = date => {
    this.setState({ dueDate: date });
  };

  onChangeNotice = ({ target: { value } }) => {
    this.setState({ notice: value });
  };

  onChangeAmount = ({ target: { value } }) => {
    this.setState({ amount: value && new Number(value) });
  };

  onReset = field => {
    this.setState({
      [field]: this.initialState[field]
    });
  };

  onSaveContacts = () => {
    const { list } = this.state;
    const {
      db,
      dbName,
      location: {
        state: { templateId }
      }
    } = this.props;

    Papa.parse(list, {
      skipEmptyLines: true,
      error: (err, file, inputElem, reason) => {
        console.error(reason);
      },
      complete: async (results, file) => {
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

  onMessageSubmit = async () => {
    this.setState({
      sent: true
    });

    const { batch, selected, dueDate, notice, amount } = this.state;
    const {
      db,
      location: {
        state: { type, templateId }
      }
    } = this.props;

    const messages = await db.find({
      selector: { type: "template", _id: templateId }
    });
    const message = messages.docs[0];

    let content = createMessageContent({ message, dueDate, amount, notice });

    if (!batch) {
      await messagePostAndPersist({
        db,
        code: selected,
        content,
        templateId,
        batchId: batch
      });
      this.goHome();
    } else {
      const promises = [];
      const list = await db.find({
        selector: {
          type: "contact",
          batchId: batch
        }
      });

      list.docs.map(doc =>
        promises.push(
          messagePostAndPersist({
            db,
            code: doc._id,
            content,
            templateId,
            batchId: batch
          })
        )
      );

      await Promise.all(promises);
      this.goHome();
    }
  };

  goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.push(location);
  };

  render() {
    const {
      list,
      contacts,
      file,
      batch,
      selected,
      dueDate,
      notice,
      amount,
      recipientOpen,
      sent,
      progress
    } = this.state;
    const {
      location: {
        state: { type, templateId }
      }
    } = this.props;

    const isNoticeValid = isMaskValid(notice, noticeMask);
    const isAmountValid = isValueRangeValid(amount.toString(), [
      AMOUNT.MIN,
      AMOUNT.MAX
    ]);

    return (
      <section>
        {(() => {
          return (
            <Fragment>
              <Row className="mb-5">
                <Col>
                  <Accordion className="border-0">
                    <AccordionHeader
                      className="border-0 p-2 text-decoration-none font-weight-normal"
                      active={recipientOpen}
                      onToggle={() => this.onToggleRecipientOpen()}
                    >
                      <span className="text-uppercase text-secondary">
                        {type === "single" ? "Destinatario" : "Destinatari"}
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
                                <Find
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
                            {list &&
                              !batch && (
                                <Row>
                                  <Col>
                                    <Button
                                      className="mt-3"
                                      block
                                      color="primary"
                                      onClick={this.onSaveContacts}
                                      disabled={progress}
                                    >
                                      {progress ? <FaSpinner /> : "Salva"}
                                    </Button>
                                  </Col>
                                  <Col />
                                </Row>
                              )}
                            {batch && (
                              <div className="message--contacts-list mt-4">
                                <Find
                                  selector={{
                                    type: "contact",
                                    batchId: batch
                                  }}
                                  sort={["_id"]}
                                  render={({ docs }) => (
                                    <ContactsList
                                      docs={docs}
                                      selected={selected}
                                    />
                                  )}
                                />
                              </div>
                            )}
                          </Fragment>
                        );
                      })()}
                    </AccordionBody>
                  </Accordion>
                </Col>
                {(() => {
                  if (type !== "single") {
                    return (
                      <Col className="col-auto border-left mb-2">
                        <header
                          className="message--recipient-upload text-uppercase text-right ml-2"
                          onClick={this.onTriggerUpload}
                        >
                          <span className="btn btn-link font-weight-bold">
                            Carica documento
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
          <Find
            selector={{
              type: "template",
              _id: templateId
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
          amount={amount}
          noticeMask={noticeMask}
          isNoticeValid={isNoticeValid}
          isAmountValid={isAmountValid}
          onChangeDueDate={this.onChangeDueDate}
          onChangeNotice={this.onChangeNotice}
          onChangeAmount={this.onChangeAmount}
          onReset={this.onReset}
        />

        {(() => {
          const isValid = [];
          if (dueDate) {
            isValid.push(moment(dueDate).isValid());
          }
          if (notice || amount) {
            isValid.push(isNoticeValid, isAmountValid);
          }

          if (type === "single") {
            isValid.push(!!selected);
            return (
              <Button
                className="mt-3 pl-5 pr-5"
                color="primary"
                disabled={isValid.includes(false)}
                onClick={this.onMessageSubmit}
              >
                Invia
              </Button>
            );
          }

          isValid.push(!!batch);
          return (
            <Button
              className="mt-3 pl-5 pr-5"
              color="primary"
              disabled={isValid.includes(false) || sent}
              onClick={this.onMessageSubmit}
            >
              {sent ? <FaSpinner /> : "Invia alla lista"}
            </Button>
          );
        })()}
      </section>
    );
  }
}

export default withDB(Message);
