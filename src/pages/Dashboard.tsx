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
import ScheduledInfoViewer, {
  ScheduledInfo,
  ScheduledInfoList
} from "../components/information/ScheduledInfoViewer";
import Toastr, {
  ToastrItem,
  ToastrType
} from "../components/notifications/Toastr";
import { getFromBackend } from "../utils/backend";
import { SelfCareSessionConfig } from "../utils/session/selfcare";

const toToastMessage = (
  title: string,
  description: string,
  type: ToastrType
): ToastrItem => ({
  // toasts with same id won't render twice at the same time
  // this is strong-enough-for-the-case check that assumes different messages have different lenghts
  id: description.length + title.length,
  title,
  description,
  type
});

type Props = RouteComponentProps<
  {},
  {},
  ReadonlyArray<MessagePostAndPersistResult>
> &
  WithNamespaces;

type DashboardState = {
  applicationConfig: PublicConfig;
  toasts: readonly ToastrItem[];
  showModal: boolean;
  lastMigrationsRefresh: ReturnType<typeof Date.now>;
  scheduledInfoList: readonly ScheduledInfo[];
};

class Dashboard extends Component<Props, DashboardState> {
  public async componentDidMount() {
    const applicationConfig = await getFromBackend<PublicConfig>({
      path: "configuration"
    });
    this.setState({ applicationConfig });
    await this.fetchScheduledInfo();
  }

  private fetchScheduledInfo = async () => {
    try {
      const response = await fetch("./scheduled-info.json", {
        cache: "no-cache"
      });
      if (!response.ok) {
        throw new Error("Error while loading scheduled info data");
      }
      const data = await response.json();

      ScheduledInfoList.decode(data).fold(
        err => console.error("Error while decoding scheduled info", err),
        scheduledInfoList => this.setState({ scheduledInfoList })
      );
    } catch (err) {
      console.error(err);
    }
  };

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
    const { location, t } = this.props;
    const applicationConfig = get(this.state, "applicationConfig");
    const showModal = get(this.state, "showModal");
    const lastMigrationsRefresh = get(this.state, "lastMigrationsRefresh");
    const scheduledInfoList = get(
      this.state,
      "scheduledInfoList",
      [] as readonly ScheduledInfo[]
    );
    const toasts = get(this.state, "toasts", [] as readonly ToastrItem[]);

    return (
      <>
        <ScheduledInfoViewer items={scheduledInfoList} />
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
        {SelfCareSessionConfig.is(applicationConfig) && (
          <>
            <section className="d-flex">
              <div className="m-3 p-3 card">
                <SummaryBox
                  key={lastMigrationsRefresh}
                  onSubmitHandler={() => this.setState({ showModal: true })}
                />
              </div>
            </section>
            {showModal && (
              <MigrationsPanel
                onFinish={reason => {
                  switch (reason) {
                    case "error":
                      // show the error, but keep the modal visible
                      return this.setState({
                        toasts: [
                          ...toasts,
                          toToastMessage(
                            t("subscription_migrations:api_error"),
                            t(
                              "subscription_migrations:api_error_claim_migrations"
                            ),
                            ToastrType.error
                          )
                        ]
                      });
                    case "done":
                      // confirm operation and close modal
                      return this.setState({
                        lastMigrationsRefresh: Date.now(),
                        showModal: false,
                        toasts: [
                          ...toasts,
                          toToastMessage(
                            t("subscription_migrations:api_success"),
                            t(
                              "subscription_migrations:api_success_claim_migrations"
                            ),
                            ToastrType.success
                          )
                        ]
                      });
                    // in any other case, just close
                    case "cancel":
                      return this.setState({ showModal: false });
                    default:
                      // tslint:disable-next-line:no-dead-store
                      const _: never = reason;
                      return this.setState({ showModal: false });
                  }
                }}
              />
            )}
          </>
        )}
        {toasts &&
          toasts.map(ti => (
            <Toastr
              key={ti.id}
              delay={5000}
              toastMessage={ti}
              onToastrClose={() =>
                this.setState({
                  toasts: toasts.filter(e => e.id !== ti.id)
                })
              }
            />
          ))}
      </>
    );
  }
}

export default withNamespaces("dashboard")(Dashboard);
