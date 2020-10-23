import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Input } from "design-react-kit";
import ReactMarkdown from "react-markdown";
import { LIMITS } from "../../utils/constants";
const { MARKDOWN } = LIMITS;

import "./MetadataDescriptionEditor.css";

type OwnProps = {
  markdown: string;
  // tslint:disable-next-line:readonly-array
  markdownLength: Readonly<[number, number]>;
  isMarkdownValid: boolean;
  onChangeMarkdown: (event: ChangeEvent<HTMLInputElement>) => void;
};
type Props = WithNamespaces & OwnProps;

class MetadataDescriptionEditor extends Component<Props, never> {
  public render() {
    const { markdown, t } = this.props;
    const { onChangeMarkdown } = this.props;

    return (
      <section className="pages--container">
        <section className="h-90 d-flex flex-column">
          <label className="m-0">{t("description")}</label>
          <section className="h-100 flex-1 d-flex flex-row">
            <section className="flex-1 h-100">
              <Input
                name="description"
                className="h-100 font-weight-normal"
                type="textarea"
                value={markdown}
                minLength={MARKDOWN.MIN}
                maxLength={MARKDOWN.MAX}
                onChange={onChangeMarkdown}
              />
            </section>
            <ReactMarkdown
              className="description-editor--message--preview form-control card shadow h-100 flex-1"
              source={markdown}
              unwrapDisallowed={true}
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
        </section>
      </section>
    );
  }
}

export default withNamespaces(["service"])(MetadataDescriptionEditor);
