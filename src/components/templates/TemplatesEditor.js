import React, { Component } from "react";

import { Input, Button } from "design-react-kit";

import TemplatePreview from "./TemplatePreview";

import "./TemplatesEditor.css";

class TemplatesEditor extends Component {
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

    return (
      <section className="h-90 d-flex flex-column">
        <Input
          type="text"
          autoFocus
          value={subject}
          placeholder="Titolo"
          minLength="10"
          maxLength="120"
          onChange={onChangeSubject}
        />
        {subject &&
          !isSubjectValid && (
            <div className="invalid-feedback d-block">
              L'oggetto deve essere di {subjectLength.join("-")} caratteri
            </div>
          )}

        <section className="flex-1 d-flex flex-row">
          <div className="flex-1 h-100">
            <Input
              className="h-100"
              type="textarea"
              value={markdown}
              minLength="80"
              maxLength="10000"
              onChange={onChangeMarkdown}
            />
            {markdown &&
              !isMarkdownValid && (
                <div className="invalid-feedback d-block">
                  Il testo deve essere di {markdownLength.join("-")} caratteri
                </div>
              )}
          </div>

          <TemplatePreview markdown={markdown} />
        </section>
      </section>
    );
  }
}

export default TemplatesEditor;
