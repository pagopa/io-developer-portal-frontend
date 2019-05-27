import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Find } from "react-pouchdb/browser";

import { Card, CardBody, CardText, CardTitle } from "design-react-kit";

import Notification from "../components/notifications/Notification";

import { RouteComponentProps } from "react-router";

import "./Dashboard.css";

import {
  MessageDocument,
  MessagePostAndPersistResult
} from "../utils/operations";
import { ContactDocument } from "../workers/getProfile";
import { TemplateDocument } from "./Message";

type Props = RouteComponentProps & WithNamespaces;

class Dashboard extends Component<Props, never> {
  private getCard<T = {}>(docs: ReadonlyArray<T>, cardTextKey: string) {
    const { t } = this.props;
    return (
      <Card className="flex-1 bg-primary text-white p-3 m-3">
        <CardBody>
          <CardTitle className="display-1">{docs.length}</CardTitle>
          <CardText>{t(cardTextKey)}</CardText>
        </CardBody>
      </Card>
    );
  }
  public render() {
    const { location } = this.props;

    return (
      <section className="d-flex">
        <section className="position-fixed dashboard--notifications-container">
          {location.state &&
            location.state.map((info: MessagePostAndPersistResult) => {
              return <Notification key={info._id} info={info} />;
            })}
        </section>
        <Find<TemplateDocument>
          selector={{
            type: "template"
          }}
          render={({ docs }) => this.getCard(docs, "templates")}
        />
        <Find<MessageDocument>
          selector={{
            type: "message"
          }}
          render={({ docs }) => this.getCard(docs, "messages")}
        />
        <Find<ContactDocument>
          selector={{
            type: "contact"
          }}
          render={({ docs }) => this.getCard(docs, "contacts")}
        />
      </section>
    );
  }
}

export default withNamespaces("dashboard")(Dashboard);
