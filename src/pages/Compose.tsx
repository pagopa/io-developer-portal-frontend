import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { withDB } from "react-pouchdb/browser";
import { RouteComponentProps, withRouter } from "react-router";

import { Button } from "design-react-kit";

import ContactAdd from "../components/contacts/ContactAdd";
import MessageMetadataEditor from "../components/messages/MessageMetadataEditor";
import TemplatesEditor from "../components/templates/TemplatesEditor";

import { LIMITS } from "../utils/constants";
import { codeMask, noticeMask } from "../utils/masks";
import {
  createMessageContent,
  messagePostAndPersist,
  profileGetAndPersist
} from "../utils/operations";
import {
  isLengthValid,
  isMaskValid,
  isValueRangeValid
} from "../utils/validators";
const { SUBJECT, MARKDOWN, AMOUNT } = LIMITS;

import moment from "moment";

import compose from "recompose/compose";
import SelectedService from "../components/SelectedService";

import "./Pages.css";

type Props = {
  db: any;
};
type ComposeProps = RouteComponentProps & WithNamespaces & Props;

type ComposeState = {
  code: string;
  subject: string;
  markdown: string;
  dueDate: any;
  amount: string;
  notice: string;
};

class Compose extends Component<ComposeProps, ComposeState> {
  public initialState: ComposeState = {
    code: "",
    subject: "",
    markdown: "",
    dueDate: undefined,
    amount: "",
    notice: ""
  };

  public state: ComposeState = {
    code: this.initialState.code,
    subject: this.initialState.subject,
    markdown: this.initialState.markdown,
    dueDate: this.initialState.dueDate,
    amount: this.initialState.amount,
    notice: this.initialState.notice
  };

  public onInputCode = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      code: value
    });
  };

  public onChangeSubject = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      subject: value
    });
  };

  public onChangeMarkdown = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      markdown: value
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
    this.setState({ amount: value && Number(value).toString() }); // TODO: verify if this is correct
  };

  public onReset = () => {
    this.setState(this.initialState);
  };

  public onMessageSubmit = async () => {
    const { code, subject, markdown, dueDate, notice, amount } = this.state;
    const { db, t } = this.props;

    // No need to await
    profileGetAndPersist({
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

    const content = createMessageContent({
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

  public goHome = ({ result }: any) => {
    const { history } = this.props;
    const location = {
      pathname: "/",
      state: [result]
    };
    history.push(location);
  };

  public render() {
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
          const isValid: ReadonlyArray<boolean> = [
            isCodeValid,
            isSubjectValid,
            isMarkdownValid
          ]
            .concat(dueDate ? moment(dueDate).isValid() : [])
            .concat(notice || amount ? [isNoticeValid, isAmountValid] : []);

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

const enhance = compose<ComposeProps, ComposeProps>(
  withDB,
  withRouter,
  withNamespaces(["compose", "format"])
);

export default enhance(Compose);
