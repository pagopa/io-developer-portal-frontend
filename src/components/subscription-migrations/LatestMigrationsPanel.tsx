import { get } from "lodash";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { getFromBackend } from "../../utils/backend";
import "../modal/Modal.css";
import DelegateItem, { MigrationStatus } from "./DelegateItem";

type OwnProps = {
  t: (key: string) => string;
};

type Props = WithNamespaces & OwnProps;

type Delegate = {
  sourceName: string;
  sourceSurname: string;
  sourceId: string;
};

// the shape of the response from getOwnershipClaimStatus remote operation
type ClaimProcedureStatus = {
  completed: number;
  failed: number;
  initial: number;
  processing: number;
};

type LatestMigrationsResponse = {
  items: ReadonlyArray<{ delegate: Delegate; status: ClaimProcedureStatus }>;
};

// the full migration status report is reduced so that it's ready to be rendered
const computeMigrationStatus = (
  status: ClaimProcedureStatus
): MigrationStatus => {
  // at least one failed mean the overall process failed
  return status.failed > 0
    ? "failed"
    : // at least one still processing means the overall process still processing
    status.processing > 0
    ? "doing"
    : // for every other case, we consider it done
      "done";
};

const fetchLatestMigrations = (): Promise<LatestMigrationsResponse["items"]> =>
  getFromBackend<LatestMigrationsResponse>({
    path: `subscriptions/migrations/ownership-claims/latest`
  }).then(({ items }) => items);

type State = {
  migrations: LatestMigrationsResponse["items"];
  disabled: boolean;
};
class MigrationsPanel extends Component<Props, State> {
  public async componentDidMount() {
    // On component mount, fetch all delegates and the status if their migrations
    return this.loadLatestMigrations();
  }

  // Retrieve migration infos for the current organization
  private async loadLatestMigrations() {
    const migrations = await fetchLatestMigrations();

    this.setState({ migrations });
  }

  public render() {
    const { t } = this.props;
    const migrations = get(this.state, "migrations");

    const LoadingMigrationList = () => null;

    const EmptyMigrationList = () => (
      <div>
        <span>{t("migrations_summary_latest_empty")}</span>
      </div>
    );

    const MigrationList = () => (
      <>
        <div>
          {migrations &&
            migrations
              .map(({ status, ...e }) => ({
                ...e,
                status: computeMigrationStatus(status)
              }))
              .map(({ delegate, status }) => (
                <div
                  key={delegate.sourceId}
                  className="d-flex mt-1"
                  style={{ gap: "10px" }}
                >
                  <DelegateItem delegate={delegate} migrationStatus={status} />
                </div>
              ))}
        </div>
      </>
    );

    return (
      <>
        {!migrations ? (
          <LoadingMigrationList />
        ) : Object.keys(migrations).length === 0 ? (
          <EmptyMigrationList />
        ) : (
          <MigrationList />
        )}
      </>
    );
  }
}
export default withNamespaces(["subscription_migrations"])(MigrationsPanel);
