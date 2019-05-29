import React, { Component, Fragment } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Card, Col, Row } from "design-react-kit";

import TemplatePreview from "../templates/TemplatePreview";

import { TemplateDocument } from "../../pages/Message";
import { LIMITS } from "../../utils/constants";
const { SUBJECT, MARKDOWN } = LIMITS;

type Props = {
  message: TemplateDocument;
};
type MessagePreviewProps = WithNamespaces & Props;

class MessagePreview extends Component<MessagePreviewProps, never> {
  public render() {
    const { message, t } = this.props;

    return (
      <Fragment>
        <div className="mb-5">
          <Row>
            <Col lg="6">
              <header className="text-uppercase mb-2 ml-2">
                {t("subject")}
              </header>
            </Col>
            <Col className="text-right text-muted">
              {message.subject.length}/{SUBJECT.MAX}
            </Col>
          </Row>
          <Card>
            <div className="p-3">{message.subject}</div>
          </Card>
        </div>
        <div className="mt-5 mb-5">
          <Row>
            <Col lg="6">
              <header className="text-uppercase mb-2 ml-2">
                {t("markdown")}
              </header>
            </Col>
            <Col className="text-right text-muted">
              {message.markdown.length}/{MARKDOWN.MAX}
            </Col>
          </Row>
          <TemplatePreview markdown={message.markdown} />
        </div>
      </Fragment>
    );
  }
}

export default withNamespaces("compose")(MessagePreview);
