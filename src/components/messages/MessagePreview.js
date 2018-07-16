import React, { Component } from "react";

import { Card } from "design-react-kit";

import TemplatePreview from "../templates/TemplatePreview";

class MessagePreview extends Component {
  render() {
    const { message } = this.props;

    return (
      <Card>
        <table className="table mb-0 border-0">
          <tbody>
            <tr>
              <td style={{ width: "15%" }}>Titolo</td>
              <td>
                <div>{message.subject}</div>
              </td>
            </tr>
            <tr>
              <td style={{ width: "15%" }}>Messaggio</td>
              <td>
                <div>
                  <TemplatePreview markdown={message.markdown} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    );
  }
}

export default MessagePreview;
