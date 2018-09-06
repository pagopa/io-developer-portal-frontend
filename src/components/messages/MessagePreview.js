import React, { Component, Fragment } from "react";

import { Row, Col, Card } from "design-react-kit";

import TemplatePreview from "../templates/TemplatePreview";

import { LIMITS } from "../../utils/";
const { SUBJECT, MARKDOWN } = LIMITS;

class MessagePreview extends Component {
  render() {
    const { message } = this.props;

    return (
      <Fragment>
        <div className="mb-5">
          <Row>
            <Col lg="6">
              <header className="text-uppercase mb-2 ml-2">Oggetto</header>
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
              <header className="text-uppercase mb-2 ml-2">Testo</header>
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

export default MessagePreview;
