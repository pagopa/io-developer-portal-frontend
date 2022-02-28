import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Find } from "react-pouchdb/browser";

import { Card, CardBody, CardText, CardTitle } from "design-react-kit";

import Notification from "../components/notifications/Notification";

import { RouteComponentProps } from "react-router";

import "./Dashboard.css";

import MigrationsPanel from "../components/subscription-migrations/MigrationsPanel";
import SummaryBox from "../components/subscription-migrations/SummaryBox";
import {
  MessageDocument,
  MessagePostAndPersistResult
} from "../utils/operations";
import { ContactDocument } from "../workers/getProfile";
import { TemplateDocument } from "./Message";

import { get } from "lodash";
import { PublicConfig } from "../../generated/definitions/backend/PublicConfig";
import { getFromBackend } from "../utils/backend";
import ff from "../utils/feature-flags";
import { SelfCareSessionConfig } from "../utils/session/selfcare";

type Props = RouteComponentProps<
  {},
  {},
  ReadonlyArray<MessagePostAndPersistResult>
> &
  WithNamespaces;

type DashboardState = {
  applicationConfig: PublicConfig;
  showModal: boolean;
};

class Dashboard extends Component<Props, DashboardState> {
  public async componentDidMount() {
    const applicationConfig = await getFromBackend<PublicConfig>({
      path: "configuration"
    });
    this.setState({ applicationConfig });
  }

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
    const applicationConfig = get(this.state, "applicationConfig");
    const showModal = get(this.state, "showModal");
    return (
      <>
        <section className="d-flex">
          <section className="position-fixed dashboard--notifications-container">
            {location.state &&
              Array.isArray(location.state) &&
              location.state.map(info => {
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
        {ff("SUBSCRIPTION_MIGRATIONS_ENABLED") &&
          SelfCareSessionConfig.is(applicationConfig) && (
            <>
              <section className="d-flex">
                <div className="m-3 p-3 card">
                  <SummaryBox
                    onSubmitHandler={() => this.setState({ showModal: true })}
                  />
                </div>
              </section>
              {showModal && (
                <MigrationsPanel
                  show={showModal}
                  onClose={() => this.setState({ showModal: false })}
                />
              )}
            </>
          )}
      </>
    );
  }
}

export default withNamespaces("dashboard")(Dashboard);
