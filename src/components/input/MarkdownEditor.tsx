import React, { ChangeEvent, Component, FocusEvent } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Input } from "design-react-kit";
import ReactMarkdown, { NodeType } from "react-markdown";
import { LIMITS } from "../../utils/constants";
const { MARKDOWN } = LIMITS;

import "./MarkdownEditor.css";

type OwnProps = {
  markdown: string;
  // tslint:disable-next-line:readonly-array
  markdownLength: Readonly<[number, number]>;
  name: string;
  isMarkdownValid: boolean;
  onChangeMarkdown: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlurMarkdown: (
    event: FocusEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
};
type Props = WithNamespaces & OwnProps;

class MarkdownEditor extends Component<Props, never> {
  public render() {
    const { markdown, name, t } = this.props;
    const { onChangeMarkdown, onBlurMarkdown } = this.props;
    // tslint:disable-next-line:readonly-array
    const allowedTypes: NodeType[] = [
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
    ];
    return (
      <section className="pages--container">
        <section className="h-90 d-flex flex-column">
          <label className="m-0">{t(name)}</label>
          <section className="h-100 flex-1 d-flex flex-row">
            <section className="flex-1 h-100">
              <Input
                name={name}
                className="h-100 font-weight-normal"
                type="textarea"
                value={markdown}
                minLength={MARKDOWN.MIN}
                maxLength={MARKDOWN.MAX}
                onChange={onChangeMarkdown}
                onBlur={onBlurMarkdown}
              />
            </section>
            <ReactMarkdown
              className="editor--message--preview form-control card shadow h-100 flex-1"
              source={markdown}
              unwrapDisallowed={true}
              allowedTypes={allowedTypes}
            />
          </section>
        </section>
      </section>
    );
  }
}

export default withNamespaces(["service"])(MarkdownEditor);
