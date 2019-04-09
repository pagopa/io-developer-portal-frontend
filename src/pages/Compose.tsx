import React, { Component } from "react";

import { withRouter } from "react-router";
import { withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";

import { Button } from "design-react-kit";

import ContactAdd from "../components/contacts/ContactAdd";
import TemplatesEditor from "../components/templates/TemplatesEditor";
import MessageMetadataEditor from "../components/messages/MessageMetadataEditor";

import { LIMITS } from '../utils/constants';
import { createMessageContent, messagePostAndPersist, profileGetAndPersist } from "../utils/operations";
import { isLengthValid, isMaskValid, isValueRangeValid } from '../utils/validators';
import { codeMask, noticeMask } from "../utils/masks";
const { SUBJECT, MARKDOWN, AMOUNT } = LIMITS;

import moment from "moment";

import compose from "recompose/compose";
import SelectedService from "../components/SelectedService";

import "./Pages.css";

type ComposeState = {
  code: string,
  subject: string,
  markdown: string,
  dueDate: any,
  amount: string,
  notice: string
};

class Compose extends Component<any, ComposeState> {
  initialState = {
    code: "",
    subject: "",
    markdown: "",
    dueDate: undefined,
    amount: "",
    notice: ""
  };

  state = {
    code: this.initialState.code,
    subject: this.initialState.subject,
    markdown: this.initialState.markdown,
    dueDate: this.initialState.dueDate,
    amount: this.initialState.amount,
    notice: this.initialState.notice
  };

  onInputCode = ({ target: { value } }) => {
    this.setState({
      code: value
    });
  };

  onChangeSubject = ({ target: { value } }) => {
    this.setState({
      subject: value
    });
  };

  onChangeMarkdown = ({ target: { value } }) => {
    this.setState({
      markdown: value
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

  onMessageSubmit = async () => {
    const { code, subject, markdown, dueDate, notice, amount } = this.state;
    const { db, t } = this.props;

    // No need to await
    const contact = profileGetAndPersist({
      code,
      db
    });

    const message = {
      subject,
      markdown
    };
    const template = await db.post({
      type: "template",
      ...message
    });

    let content = createMessageContent({
      message,
      dueDate,
      amount,
      notice,
      dueDateFormat: t("format:date")
    });

    const result = await messagePostAndPersist({
      db,
      code,
      content,
      templateId: template.id
    });

    this.goHome({ result });
  };

  goHome = ({ result }) => {
    const { history } = this.props;
    const location = {
      pathname: "/",
      state: [result]
    };
    history.push(location);
  };

  render() {
    const { code, subject, markdown, dueDate, notice, amount } = this.state;
    const { t } = this.props;

    const isCodeValid = isMaskValid(code, codeMask);
    const isSubjectValid = isLengthValid(subject, [SUBJECT.MIN, SUBJECT.MAX]);
    const isMarkdownValid = isLengthValid(markdown, [
      MARKDOWN.MIN,
      MARKDOWN.MAX
    ]);
    const isNoticeValid = isMaskValid(notice, noticeMask);
    const isAmountValid = isValueRangeValid(amount, [AMOUNT.MIN, AMOUNT.MAX]);

    return (
      <section className="pages--container">
        <SelectedService />
        <ContactAdd
          code={code}
          codeMask={codeMask}
          isCodeValid={isCodeValid}
          onInputCode={this.onInputCode}
        />

        <section className="h-80">
          <TemplatesEditor
            subject={subject}
            markdown={markdown}
            subjectLength={[SUBJECT.MIN, SUBJECT.MAX]}
            markdownLength={[MARKDOWN.MIN, MARKDOWN.MAX]}
            isSubjectValid={isSubjectValid}
            isMarkdownValid={isMarkdownValid}
            onChangeSubject={this.onChangeSubject}
            onChangeMarkdown={this.onChangeMarkdown}
          />
        </section>

        <MessageMetadataEditor
          dueDate={dueDate}
          notice={notice}
          amount={amount.toString()}
          isNoticeValid={isNoticeValid}
          isAmountValid={isAmountValid}
          onChangeDueDate={this.onChangeDueDate}
          onChangeNotice={this.onChangeNotice}
          onChangeAmount={this.onChangeAmount}
          onReset={this.onReset}
        />

        {(() => {
          const isValid = [isCodeValid, isSubjectValid, isMarkdownValid];

          if (dueDate) {
            isValid.push(moment(dueDate).isValid());
          }
          if (notice || amount) {
            isValid.push(isNoticeValid, isAmountValid);
          }

          return (
            <Button
              className="mt-3 pl-5 pr-5"
              color="primary"
              disabled={isValid.includes(false)}
              onClick={this.onMessageSubmit}
            >
              {t("send")}
            </Button>
          );
        })()}
      </section>
    );
  }
}

const enhance = compose(
  withDB,
  withRouter,
  withNamespaces(["compose", "format"])
);

export default enhance(Compose);
