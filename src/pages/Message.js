import React, { Component } from "react";

import {
  Row,
  Col,
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

import DatePicker from "react-datepicker";

import MessagePreview from "../components/messages/MessagePreview";
import ContactsList from "../components/contacts/ContactsList";

import { get, post } from "../api";

import "./Message.css";

class Message extends Component {
  initialState = {
    selected: "",
    dueDate: undefined,
    amount: "",
    notice: ""
  };

  state = {
    selected: this.initialState.selected,
    dueDate: this.initialState.dueDate,
    amount: this.initialState.amount,
    notice: this.initialState.notice
  };

  onContactSelect = selected => {
    this.setState({ selected });
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

  onMessageSubmit = async () => {
    const { selected, dueDate, notice, amount } = this.state;
    const {
      db,
      location: { state }
    } = this.props;

    const messages = await db.find({
      selector: { type: "template", _id: state }
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

    const sent = await post({
      path: `messages/${selected}`,
      options: {
        body: {
          time_to_live: 3600,
          content
        }
      }
    });

    if (sent.status) {
      // The API returns errors with shape { detail, status, title }
      console.error(sent);
      return;
    }

    const details = await get({
      path: `messages/${selected}/${sent.id}`
    });

    db.put({
      ...details,
      _id: sent.id,
      type: "message",
      template: state
    });

    this.goHome();
  };

  goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.push(location);
  };

  render() {
    const { selected, dueDate, notice, amount } = this.state;
    const {
      location: { state }
    } = this.props;

    return (
      <section>
        <h2 className="display-3">Contatti</h2>
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

        <div className="message--preview mb-4">
          <Find
            selector={{
              type: "template",
              _id: state
            }}
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

        <Button
          className="mt-3"
          block
          color="primary"
          disabled={!selected}
          onClick={this.onMessageSubmit}
        >
          Invia
        </Button>
      </section>
    );
  }
}

export default withDB(Message);
