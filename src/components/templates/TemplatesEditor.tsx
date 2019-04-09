import React, { Component } from "react";

import { withNamespaces } from "react-i18next";

import { Input, Button } from "design-react-kit";

import TemplatePreview from "./TemplatePreview";

import { LIMITS } from "../../utils/constants";
const { SUBJECT, MARKDOWN } = LIMITS;

import "./TemplatesEditor.css";

class TemplatesEditor extends Component<any, any>  {
  render() {
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
      <section className="h-90 d-flex flex-column">
        <Input
          className="font-weight-normal"
          type="text"
          autoFocus
          value={subject}
          placeholder={t("subject")}
          minLength={SUBJECT.MIN}
          maxLength={SUBJECT.MAX}
          onChange={onChangeSubject}
        />
        {subject &&
          !isSubjectValid && (
            <div className="invalid-feedback d-block">
              {t("validation:subject", { length: subjectLength.join("-") })}
            </div>
          )}

        <section className="flex-1 d-flex flex-row">
          <div className="flex-1 h-100">
            <Input
              className="h-100 font-weight-normal"
              type="textarea"
              value={markdown}
              minLength={MARKDOWN.MIN}
              maxLength={MARKDOWN.MAX}
              onChange={onChangeMarkdown}
            />
            {markdown &&
              !isMarkdownValid && (
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
