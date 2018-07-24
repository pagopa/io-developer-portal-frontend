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

class MessageMetadataEditor extends Component {
  render() {
    const {
      dueDate,
      notice,
      amount,
      noticeMask,
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
          <Label>Scadenza</Label>
          <InputGroup className="position-relative input-group-datepicker">
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
          <Label>Numero Avviso</Label>

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
                  Per favore digita 18 caratteri numerici e l'importo
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
          <Label>Importo</Label>

          <InputGroup className="position-relative">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>€</InputGroupText>
              <InputGroupText>{amount && amount / 100}</InputGroupText>
            </InputGroupAddon>
            <Input
              aria-label="€"
              type="number"
              maxLength="10"
              value={amount}
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
