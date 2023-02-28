import moment from "moment";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type Delegate = {
  sourceName: string;
  sourceSurname: string;
  sourceId: string;
};

// migration status as it matters for this component
export type MigrationStatus = "done" | "doing" | "todo" | "failed";

const StatusIcon = ({
  status,
  t
}: {
  status: MigrationStatus;
  t: (key: string) => string;
}) => {
  switch (status) {
    case "doing":
      return <>{t("migration_status_doing")}</>;
    case "done":
      return <>{t("migration_status_done")}</>;
    case "failed":
      return <>{t("migration_status_failed")}</>;
    case "todo":
      // just an empty string
      return <></>;
    default:
      const _: never = status; // exhaustive check
      return null;
  }
};

const LastUpdate = ({ timestamp }: { timestamp: string }) => {
  return <>{moment(timestamp).format("DD/MM/YYYY, HH:mm:ss")}</>;
};

type OwnProps = {
  t: (key: string) => string;
  delegate: Delegate;
  migrationStatus: MigrationStatus;
  lastUpdate?: string;
};

type Props = WithNamespaces & OwnProps;

class DelegateItem extends Component<Props> {
  public render() {
    const {
      t,
      delegate: { sourceName: name, sourceSurname: surname },
      migrationStatus,
      lastUpdate
    } = this.props;
    const isStatusLoaded = typeof migrationStatus !== "undefined";

    return (
      <>
        <div style={{ minWidth: "15em" }}>
          {name} {surname}
        </div>
        <div style={{ minWidth: "9em" }}>
          {isStatusLoaded && (
            <>
              <span>
                <StatusIcon status={migrationStatus} t={t} />
              </span>
            </>
          )}
        </div>
        {lastUpdate && (
          <div style={{ flex: 1 }}>
            <span>
              <LastUpdate timestamp={lastUpdate} />
            </span>
          </div>
        )}
      </>
    );
  }
}
export default withNamespaces("subscription_migrations")(DelegateItem);
