import React, { Component } from "react";

import {
  Row,
  Col,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "design-react-kit";

import DatePicker from "react-datepicker";
import MaskedInput from "react-text-mask";

import FaCalendar from "react-icons/lib/fa/calendar";

import { noticeMask, amountMask } from "../../utils/masks";
import { LIMITS } from "../../utils/";
const { NOTICE } = LIMITS;

import "./MessageMetadataEditor.css";

class MessageMetadataEditor extends Component {
  render() {
    const {
      dueDate,
      notice,
      amount,
      isNoticeValid,
      isAmountValid,
      onChangeDueDate,
      onChangeNotice,
      onChangeAmount,
      onReset
    } = this.props;

    return (
      <Row className="form-inline">
        <Col lg="4">
          <Label className="text-uppercase">Scadenza</Label>
          <InputGroup className="position-relative input-group-datepicker">
            <div className="position-absolute messagemetatada--editor-calendar p-2">
              <FaCalendar className="text-primary" />
            </div>
            <DatePicker
              selected={dueDate}
              onChange={onChangeDueDate}
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
                onClick={() => onReset("dueDate")}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </InputGroup>
        </Col>

        <Col lg="5">
          <Label className="text-uppercase">N° Avviso</Label>

          <InputGroup className="position-relative">
            <MaskedInput
              type="text"
              className="form-control"
              placeholder=""
              aria-label="Numero Avviso"
              value={notice}
              guide={false}
              mask={noticeMask}
              onChange={onChangeNotice}
            />
            {(notice || amount) &&
              (!isNoticeValid && (
                <div className="invalid-feedback d-block">
                  Per favore digita {NOTICE.MAX} caratteri numerici e l'importo
                </div>
              ))}

            {notice && (
              <button
                className="close position-absolute close-button"
                aria-label="Reset"
                onClick={() => onReset("notice")}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </InputGroup>
        </Col>

        <Col lg="3">
          <Label className="text-uppercase">Importo</Label>

          <InputGroup className="position-relative">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>€</InputGroupText>
              <InputGroupText>{amount && amount / 100}</InputGroupText>
            </InputGroupAddon>
            <MaskedInput
              type="text"
              className="form-control"
              placeholder=""
              aria-label="€"
              value={amount}
              guide={false}
              mask={amountMask}
              onChange={onChangeAmount}
            />
            {(notice || amount) &&
              (!isAmountValid && (
                <div className="invalid-feedback d-block">
                  Per favore digita l'importo in Centesimi ed il Numero di
                  Avviso
                </div>
              ))}

            {amount && (
              <button
                className="close position-absolute close-button"
                aria-label="Reset"
                onClick={() => onReset("amount")}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </InputGroup>
        </Col>
      </Row>
    );
  }
}

export default MessageMetadataEditor;
