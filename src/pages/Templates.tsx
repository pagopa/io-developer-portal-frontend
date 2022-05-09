import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { Find, withDB } from "react-pouchdb/browser";
import { RouteComponentProps, withRouter } from "react-router";

import { Link } from "react-router-dom";

import { Button } from "design-react-kit";

import SelectedService from "../components/SelectedService";
import TemplatesEditor from "../components/templates/TemplatesEditor";
import TemplatesList from "../components/templates/TemplatesList";

import compose from "recompose/compose";

import { LIMITS } from "../utils/constants";
import { isLengthValid } from "../utils/validators";
const { SUBJECT, MARKDOWN } = LIMITS;

import "./Pages.css";
import Database = PouchDB.Database;
import ExistingDocument = PouchDB.Core.ExistingDocument;

import { TemplateDocument } from "./Message";

type OwnProps = {
  db: Database<Template>;
};

type Props = RouteComponentProps<{ template_id: string }> &
  WithNamespaces &
  OwnProps;

type TemplatesState = {
  subject: string;
  markdown: string;
  doc?: ExistingDocument<Template>;
};

interface Template {
  subject: string;
  markdown: string;
}

class Templates extends Component<Props, TemplatesState> {
  public initialState: TemplatesState = {
    subject: "",
    markdown: "",
    doc: undefined
  };

  public state: TemplatesState = {
    subject: this.initialState.subject,
    markdown: this.initialState.markdown,
    doc: this.initialState.doc
  };

  public componentWillReceiveProps(
    nextProps: RouteComponentProps<{ template_id: string }>
  ) {
    const {
      match: {
        params: { template_id }
      }
    } = nextProps;

    if (template_id !== this.props.match.params.template_id) {
      if (!template_id || template_id === "new") {
        this.setState({
          subject: this.initialState.subject,
          markdown: this.initialState.markdown,
          doc: this.initialState.doc
        });
      } else {
        const { db } = this.props;

        (async () => {
          const messages = await db.find({
            selector: { type: "template", _id: { $eq: template_id } }
          });

          const message = messages.docs[0];

          const { subject, markdown } = message;
          this.setState({
            subject,
            markdown,
            doc: message
          });
        })().catch(error => {
          console.error("db find error:", JSON.stringify(error, null, 4));
        });
      }
    }
  }

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

  public onSaveTemplate = () => {
    const { subject, markdown, doc } = this.state;

    const {
      db,
      match: {
        params: { template_id }
      }
    } = this.props;

    if (template_id && template_id !== "new") {
      db.put({
        ...doc,
        subject,
        markdown
      }).then(() => {
        this.goBack();
      });
    } else {
      db.post({
        type: "template",
        subject,
        markdown
      }).then(() => {
        this.goBack();
      });
    }
  };

  public goBack = () => {
    const { history } = this.props;
    const location = {
      pathname: "/templates"
    };
    history.push(location);
  };
  public render() {
    const { subject, markdown } = this.state;
    const {
      match: {
        params: { template_id }
      }
    } = this.props;
    const { t } = this.props;

    const isSubjectValid = isLengthValid(subject, [SUBJECT.MIN, SUBJECT.MAX]);
    const isMarkdownValid = isLengthValid(markdown, [
      MARKDOWN.MIN,
      MARKDOWN.MAX
    ]);

    return (
      <section>
        <SelectedService />
        {(() => {
          if (!template_id) {
            return (
              <div>
                <div className="d-flex justify-content-end">
                  <Link
                    className="btn btn-primary mb-3"
                    to={{ pathname: "templates/new" }}
                  >
                    {t("add")}
                  </Link>
                </div>

                <Find<TemplateDocument>
                  selector={{
                    type: "template"
                  }}
                  sort={["_id"]}
                  render={({ docs }) => <TemplatesList docs={docs} />}
                />
              </div>
            );
          }

          return (
            <section className="mb-5">
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

              <Button
                className="mt-5"
                block={true}
                color="primary"
                disabled={[isSubjectValid, isMarkdownValid].includes(false)}
                onClick={this.onSaveTemplate}
              >
                {t("save")}
              </Button>
            </section>
          );
        })()}
      </section>
    );
  }
}

const enhance = compose<Props, Props>(
  withDB,
  withRouter,
  withNamespaces("template")
);

export default enhance(Templates);
