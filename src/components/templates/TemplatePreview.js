import React, { Component } from "react";

import ReactMarkdown from "react-markdown";

class TemplatePreview extends Component {
  render() {
    const { markdown } = this.props;
    
    return (
        <ReactMarkdown
          className="templates-editor--message--preview form-control bg-light border-0 h-100 flex-1"
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
    );
  }
}

export default TemplatePreview;
