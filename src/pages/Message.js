import React, { Component } from "react";
import ReactDOM from "react-dom";

import {
  Row,
  Col,
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

import DatePicker from "react-datepicker";

import MessagePreview from "../components/messages/MessagePreview";
import ContactsList from "../components/contacts/ContactsList";

import { contactGetAndPersist, messagePostAndPersist } from "../utils";
import { get, post } from "../api";

import "./Message.css";
import { log } from "util";

class Message extends Component {
  initialState = {
    list: "",
    batch: "",
    selected: "",
    dueDate: undefined,
    amount: "",
    notice: ""
  };

  state = {
    list: this.initialState.list,
    batch: this.initialState.batch,
    selected: this.initialState.selected,
    dueDate: this.initialState.dueDate,
    amount: this.initialState.amount,
    notice: this.initialState.notice
  };

  fileInput = React.createRef();

  onContactSelect = selected => {
    this.setState({ selected });
  };

  onChangeList = ({ target: { value } }) => {
    this.setState({
      batch: this.initialState.batch,
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
            if (value.length === 16) {
              filtered.push(value);
            }
          })
        );

        this.setState({
          batch: this.initialState.batch,
          list: filtered.join("\n")
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
    this.setState({ amount: new Number(value) });
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

        const promises = [];
        results.data.map(async ([result]) => {
          promises.push(
            contactGetAndPersist({ code: result, db, batchId: batch.id })
          );
        });

        Promise.all(promises)
          .then(results => {
            this.setState({
              batch: batch.id
            });
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
  };

  onMessageSubmit = async () => {
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

    let content = {
      subject: message.subject,
      markdown: message.markdown,
      due_date: dueDate && moment(dueDate).toISOString()
    };

    if (amount || notice) {
      content = Object.assign(content, {
        payment_data: {
          amount,
          notice_number: notice
        }
      });
    }

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
    const { list, batch, selected, dueDate, notice, amount } = this.state;
    const {
      location: {
        state: { type, templateId }
      }
    } = this.props;

    return (
      <section>
        {(() => {
          if (type === "single") {
            return (
              <div className="message--contacts-list mb-4">
                <h2 className="display-4">Seleziona un contatto </h2>
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
            );
          }

          return (
            <div className="message--import-list mb-4">
              <h2 className="display-4">Importa una lista </h2>
              <Row>
                <Col>
                  <Card>
                    <Input
                      className="flex-1 h-100 border-0"
                      type="textarea"
                      value={list}
                      onChange={this.onChangeList}
                    />
                  </Card>
                </Col>
                <Col>
                  <Card
                    className="h-100 d-flex justify-content-center align-items-center cursor-pointer"
                    onClick={this.onTriggerUpload}
                  >
                    <i className="it-upload" />
                    <Input
                      className="d-none"
                      type="file"
                      ref={this.fileInput}
                      onChange={this.onFileUpdate}
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
                      >
                        Salva
                      </Button>
                    </Col>
                    <Col />
                  </Row>
                )}
              {batch && (
                <div className="mt-4">
                  <Find
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
            </div>
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

        <Row className="form-inline">
          <Col lg="4">
            <Label>Scadenza</Label>
            <InputGroup className="position-relative input-group-datepicker">
              <DatePicker
                selected={dueDate}
                onChange={this.onChangeDueDate}
                dateFormat="DD/MM/YYYY HH:mm"
                showTimeSelect
                timeCaption="Orario"
                timeFormat="HH:mm"
                timeIntervals={60}
                disabledKeyboardNavigation
              />

              {dueDate && (
                <button
                  className="close position-absolute close-button"
                  aria-label="Reset"
                  onClick={() => this.onReset("dueDate")}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </InputGroup>
          </Col>

          <Col lg="5">
            <Label>Numero Avviso</Label>

            <InputGroup className="position-relative">
              <Input
                type="text"
                value={notice}
                onChange={this.onChangeNotice}
              />

              {notice && (
                <button
                  className="close position-absolute close-button"
                  aria-label="Reset"
                  onClick={() => this.onReset("notice")}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </InputGroup>
          </Col>

          <Col lg="3">
            <Label>Importo</Label>

            <InputGroup className="position-relative">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>€</InputGroupText>
                <InputGroupText>{amount && amount / 100}</InputGroupText>
              </InputGroupAddon>
              <Input
                aria-label="€"
                type="number"
                value={amount}
                onChange={this.onChangeAmount}
              />

              {amount && (
                <button
                  className="close position-absolute close-button"
                  aria-label="Reset"
                  onClick={() => this.onReset("amount")}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </InputGroup>
          </Col>
        </Row>

        {(() => {
          if (type === "single") {
            return (
              <Button
                className="mt-3"
                block
                color="primary"
                disabled={!selected}
                onClick={this.onMessageSubmit}
              >
                Invia
              </Button>
            );
          }

          return (
            <Button
              className="mt-3"
              block
              color="primary"
              disabled={!batch}
              onClick={this.onMessageSubmit}
            >
              Invia alla lista
            </Button>
          );
        })()}
      </section>
    );
  }
}

export default withDB(Message);
