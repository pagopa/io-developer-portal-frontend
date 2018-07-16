import React, { Component } from "react";

import { Input, Button } from "design-react-kit";

import TemplatePreview from "./TemplatePreview";

import "./TemplatesEditor.css";

class TemplatesEditor extends Component {
  render() {
    const {
      subject,
      markdown,
      onChangeSubject,
      onChangeMarkdown
    } = this.props;

    return (
      <section className="h-100 d-flex flex-column">
        <Input
          type="text"
          value={subject}
          placeholder="Titolo"
          minLength="10"
          maxLength="120"
          onChange={onChangeSubject}
        />
        <section className="flex-1 d-flex flex-row">
          <Input
            type="textarea"
            value={markdown}
            className="flex-1 h-100"
            minLength="80"
            maxLength="10000"
            onChange={onChangeMarkdown}
          />

          <TemplatePreview markdown={markdown} />
        </section>
      </section>
    );
  }
}

export default TemplatesEditor;
