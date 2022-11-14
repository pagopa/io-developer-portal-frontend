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

type OwnProps = {
  t: (key: string) => string;
  delegate: Delegate;
  migrationStatus: MigrationStatus;
};

type Props = WithNamespaces & OwnProps;

class DelegateItem extends Component<Props> {
  public render() {
    const {
      t,
      delegate: { sourceName: name, sourceSurname: surname },
      migrationStatus
    } = this.props;
    const isStatusLoaded = typeof migrationStatus !== "undefined";

    return (
      <>
        <div style={{ minWidth: "15em" }}>
          {name} {surname}
        </div>
        <div style={{ flex: 1 }}>
          {isStatusLoaded && (
            <>
              <span>
                <StatusIcon status={migrationStatus} t={t} />
              </span>
            </>
          )}
        </div>
      </>
    );
  }
}
export default withNamespaces("subscription_migrations")(DelegateItem);
