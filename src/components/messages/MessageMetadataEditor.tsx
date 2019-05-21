import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import {
  Col,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row
} from "design-react-kit";

import { Moment } from "moment";
import DatePicker from "react-datepicker";
import MaskedInput from "react-text-mask";

import FaCalendar from "react-icons/lib/fa/calendar";

import { LIMITS } from "../../utils/constants";
import { amountMask, noticeMask } from "../../utils/masks";
const { NOTICE } = LIMITS;

import "./MessageMetadataEditor.css";

type OwnProps = {
  dueDate: Moment | null;
  notice: any;
  amount: any;
  isNoticeValid: any;
  isAmountValid: any;
  onChangeDueDate: any;
  onChangeNotice: any;
  onChangeAmount: any;
  onReset: any;
};
type Props = WithNamespaces & OwnProps;

class MessageMetadataEditor extends Component<Props, never> {
  public render() {
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
    const { t } = this.props;

    return (
      <Row className="form-inline">
        <Col lg="4">
          <Label className="text-uppercase">{t("due_date")}</Label>
          <InputGroup className="position-relative input-group-datepicker">
            <div className="position-absolute messagemetatada--editor-calendar p-2">
              <FaCalendar className="text-primary" />
            </div>
            <DatePicker
              selected={dueDate}
              onChange={onChangeDueDate}
              dateFormat={t("format:date")}
              showTimeSelect={true}
              timeCaption={t("time")}
              timeFormat={t("format:time")}
              timeIntervals={60}
              disabledKeyboardNavigation={true}
            />

            {dueDate && (
              <button
                className="close position-absolute close-button"
                aria-label={t("reset")}
                onClick={() => onReset("dueDate")}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </InputGroup>
        </Col>

        <Col lg="5">
          <Label className="text-uppercase">{t("notice")}</Label>

          <InputGroup className="position-relative">
            <MaskedInput
              type="text"
              className="form-control"
              placeholder=""
              aria-label={t("notice")}
              value={notice}
              guide={false}
              mask={[...noticeMask]}
              onChange={onChangeNotice}
            />
            {(notice || amount) &&
              (!isNoticeValid && (
                <div className="invalid-feedback d-block">
                  {t("validation:notice", { max: NOTICE.MAX })}
                </div>
              ))}

            {notice && (
              <button
                className="close position-absolute close-button"
                aria-label={t("reset")}
                onClick={() => onReset("notice")}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </InputGroup>
        </Col>

        <Col lg="3">
          <Label className="text-uppercase">{t("amount")}</Label>

          <InputGroup className="position-relative">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{t("format:currency")}</InputGroupText>
              <InputGroupText>{amount && amount / 100}</InputGroupText>
            </InputGroupAddon>
            <MaskedInput
              type="text"
              className="form-control"
              placeholder=""
              aria-label={t("format:currency")}
              value={amount}
              guide={false}
              mask={[...amountMask]}
              onChange={onChangeAmount}
            />
            {(notice || amount) &&
              (!isAmountValid && (
                <div className="invalid-feedback d-block">
                  {t("validation:amount")}
                </div>
              ))}

            {amount && (
              <button
                className="close position-absolute close-button"
                aria-label={t("reset")}
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

export default withNamespaces(["compose", "format", "validation"])(
  MessageMetadataEditor
);