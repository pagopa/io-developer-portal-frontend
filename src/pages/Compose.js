import React, { Component } from "react";

import { withRouter } from "react-router";

import { Button } from "design-react-kit";

import ContactAdd from "../components/contacts/ContactAdd";
import TemplatesEditor from "../components/templates/TemplatesEditor";
import MessageMetadataEditor from "../components/messages/MessageMetadataEditor";

import { withDB } from "react-pouchdb/browser";

import {
  isMaskValid,
  isLengthValid,
  isValueRangeValid,
  createMessageContent,
  contactGetAndPersist,
  messagePostAndPersist,
  goHome
} from "../utils";
import { codeMask, noticeMask } from "../masks";

import moment from "moment";

import compose from "recompose/compose";

import "./Templates.css";

class Compose extends Component {
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
    const { db } = this.props;

    const contact = contactGetAndPersist({
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

    let content = createMessageContent({ message, dueDate, amount, notice });

    await messagePostAndPersist({
      db,
      code,
      content,
      templateId: template.id
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
    const { code, subject, markdown, dueDate, notice, amount } = this.state;

    const isCodeValid = isMaskValid(code, codeMask);
    const isSubjectValid = isLengthValid(subject, [10, 120]);
    const isMarkdownValid = isLengthValid(markdown, [80, 10000]);
    const isNoticeValid = isMaskValid(notice, noticeMask);
    const isAmountValid = isValueRangeValid(amount.toString(), [1, 9999999999]);

    return (
      <section className="templates--container">
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
            subjectLength={[10, 120]}
            markdownLength={[80, 10000]}
            isSubjectValid={isSubjectValid}
            isMarkdownValid={isMarkdownValid}
            onChangeSubject={this.onChangeSubject}
            onChangeMarkdown={this.onChangeMarkdown}
          />
        </section>

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
          const isValid = [isCodeValid, isSubjectValid, isMarkdownValid];

          if (dueDate) {
            isValid.push(moment(dueDate).isValid());
          }
          if (notice || amount) {
            isValid.push(isNoticeValid, isAmountValid);
          }

          return (
            <Button
              className="mt-3"
              block
              color="primary"
              disabled={isValid.includes(false)}
              onClick={this.onMessageSubmit}
            >
              Invia
            </Button>
          );
        })()}
      </section>
    );
  }
}

const enhance = compose(
  withDB,
  withRouter
);

export default enhance(Compose);
