import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Input } from "design-react-kit";

import TemplatePreview from "./TemplatePreview";

import { LIMITS } from "../../utils/constants";
const { SUBJECT, MARKDOWN } = LIMITS;

import "./TemplatesEditor.css";

type OwnProps = {
  subject: string;
  markdown: string;
  // tslint:disable-next-line:readonly-array
  subjectLength: Readonly<[number, number]>;
  // tslint:disable-next-line:readonly-array
  markdownLength: Readonly<[number, number]>;
  isSubjectValid: boolean;
  isMarkdownValid: boolean;
  onChangeSubject: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeMarkdown: (event: ChangeEvent<HTMLInputElement>) => void;
};
type Props = WithNamespaces & OwnProps;

class TemplatesEditor extends Component<Props, never> {
  public render() {
    const {
      subject,
      markdown,
      subjectLength,
      markdownLength,
      isSubjectValid,
      isMarkdownValid
    } = this.props;
    const { onChangeSubject, onChangeMarkdown } = this.props;
    const { t } = this.props;

    return (
      <section className="d-flex flex-column" style={{ height: "600px"}}>
        <Input
          className="font-weight-normal"
          type="text"
          autoFocus={true}
          value={subject}
          placeholder={t("subject")}
          minLength={SUBJECT.MIN}
          maxLength={SUBJECT.MAX}
          onChange={onChangeSubject}
        />
        {subject && !isSubjectValid && (
          <div className="invalid-feedback d-block">
            {t("validation:subject", { length: subjectLength.join("-") })}
          </div>
        )}

        <section className="flex-1 d-flex flex-row h-90">
          <div className="flex-1 h-100">
            <Input
              className="h-100 font-weight-normal"
              type="textarea"
              value={markdown}
              minLength={MARKDOWN.MIN}
              maxLength={MARKDOWN.MAX}
              onChange={onChangeMarkdown}
            />
            {markdown && !isMarkdownValid && (
              <div className="invalid-feedback d-block">
                {t("validation:markdown", { length: markdownLength.join("-") })}
              </div>
            )}
          </div>

          <TemplatePreview markdown={markdown} />
        </section>
      </section>
    );
  }
}

export default withNamespaces(["template", "validation"])(TemplatesEditor);
