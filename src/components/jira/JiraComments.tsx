import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import "./JiraComments.css";
type JiraComment = {
  body: string;
  created: string;
};

type OwnProps = {
  t: (key: string) => string;
  comments: ReadonlyArray<JiraComment>;
};

type Props = WithNamespaces & OwnProps;

class JiraComments extends Component<Props> {
  public state: {} = {};

  public componentDidMount() {
    this.setState({});
  }

  private getDate(date: string) {
    const readableDate = new Date(date);

    return readableDate.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  }

  public render() {
    const { t } = this.props;
    return (
      <div className="comments-box p-5 mt-4 mb-4">
        <p>{t("publish_error_detail")}</p>
        <ul>
          {this.props.comments.map((comment, index) => {
            return (
              <li className="my-2" key={index}>
                <span className="comment-date">
                  {this.getDate(comment.created)}
                </span>
                {" - "}
                {comment.body}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
export default withNamespaces("service")(JiraComments);
