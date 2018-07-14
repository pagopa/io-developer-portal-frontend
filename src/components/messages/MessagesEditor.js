import React, { Component } from "react";

import { Input } from "design-react-kit";

import ReactMarkdown from "react-markdown";

class MessagesEditor extends Component {
  render() {
    const { subject, markdown, onChangeSubject, onChangeMarkdown } = this.props;

    return (
      <section className="flex-1 d-flex flex-column">
        <Input
          type="text"
          value={subject}
          placeholder="Titolo"
          minLength="10"
          maxLength="120"
          onChange={onChangeSubject}
        />
        <Input
          type="textarea"
          value={markdown}
          className="flex-1"
          minLength="80"
          maxLength="10000"
          onChange={onChangeMarkdown}
        />

        <ReactMarkdown
          className="home--message--preview flex-1 mt-5"
          source={markdown}
          unwrapDisallowed
          allowedTypes={[
            "root",
            "break",
            "paragraph",
            "emphasis",
            "strong",
            // "thematicBreak",
            // "blockquote",
            "delete",
            // "link",
            // "image",
            // "linkReference",
            // "imageReference",
            // "table",
            // "tableHead",
            // "tableBody",
            // "tableRow",
            // "tableCell",
            "list",
            "listItem",
            // "definition",
            "heading"
            // "inlineCode",
            // "code",
            // "html",
            // "virtualHtml"
          ]}
        />
      </section>
    );
  }
}

export default MessagesEditor;
