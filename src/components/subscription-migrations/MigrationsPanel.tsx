import { get } from "lodash";
import React, { Component, MouseEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { getFromBackend } from "../../utils/backend";

import "../modal/Modal.css";
import DelegateItem, { MigrationStatus } from "./DelegateItem";

type OwnProps = {
  t: (key: string) => string;
  onClose: (event: MouseEvent) => void;
};

type Props = WithNamespaces & OwnProps;

type Delegate = {
  sourceName: string;
  sourceSurname: string;
  sourceId: string;
};
type DelegateListResponse = {
  delegates: readonly Delegate[];
};
// the shape of the response from getOwnershipClaimStatus remote operation
type ClaimProcedureStatusResponse = {
  data: {
    COMPLETED: number;
    FAILED: number;
    INITIAL: number;
    PROCESSING: number;
  };
};

// A single migration, composed by its status and the relative delegate
type MigrationItem = Delegate & {
  status: ClaimProcedureStatusResponse["data"];
};

// An hashmap with all the migrations
type MigrationRepository = Record<Delegate["sourceId"], MigrationItem>;

// the full migration status report is reduced so that it's ready to be rendered
const computeMigrationStatus = (
  status: ClaimProcedureStatusResponse["data"]
): MigrationStatus => {
  if (get(status, "FAILED", 0) > 0) {
    return "failed";
  }
  if (get(status, "INITIAL", 0) > 0) {
    return "todo";
  }
  if (get(status, "PROCESSING", 0) > 0) {
    return "doing";
  }
  return "done";
};

const fetchMigrationStatus = (
  id: Delegate["sourceId"]
): Promise<ClaimProcedureStatusResponse["data"]> =>
  getFromBackend<ClaimProcedureStatusResponse>({
    path: `subscriptions/migrations/ownership-claims/${id}`
  }).then(({ data }) => data);

// converts a generic list into a record, using one of the fields as key
// tslint:disable-next-line: no-any
const listToRecord = <T extends Record<string, any>, K extends keyof T>(
  list: readonly T[],
  key: K
): Record<T[K], T> => {
  return list.reduce((p, e) => ({ ...p, [e[key]]: e }), {} as Record<T[K], T>);
};

type State = {
  migrations: MigrationRepository;
  selectedForMigration: ReadonlyArray<Delegate["sourceId"]>;
};
class MigrationsPanel extends Component<Props, State> {
  public async componentDidMount() {
    // On component mount, fetch all delegates and the status if their migrations

    const { delegates } = await getFromBackend<DelegateListResponse>({
      path: "/subscriptions/migrations/delegates"
    });

    const listOfMigrations: readonly MigrationItem[] = await Promise.all(
      delegates.map(async delegate => ({
        ...delegate,
        status: await fetchMigrationStatus(delegate.sourceId)
      }))
    );

    this.setState({ migrations: listToRecord(listOfMigrations, "sourceId") });
  }

  private startMigration() {
    // TODO: implement migration claim
    alert(this.props.t("migrations_not_available"));
  }

  public render() {
    const { t } = this.props;
    const migrations = get(this.state, "migrations");
    const selectedForMigration = get(
      this.state,
      "selectedForMigration",
      [] as readonly string[]
    );

    const EmptyDelegateList = () => (
      <div>
        <span>{t("migrations_panel_list_empty")}</span>
      </div>
    );

    const MigrationList = () => (
      <>
        <div>
          {migrations &&
            Object.values(migrations).map(d => (
              <DelegateItem
                delegate={d}
                key={d.sourceId}
                onSelectionChange={(id, selected) => {
                  if (selected) {
                    this.setState({
                      selectedForMigration: [...selectedForMigration, id]
                    });
                  } else {
                    this.setState({
                      selectedForMigration: selectedForMigration.filter(
                        e => e !== id
                      )
                    });
                  }
                }}
                selected={selectedForMigration.includes(d.sourceId)}
                migrationStatus={computeMigrationStatus(d.status)}
              />
            ))}
        </div>
      </>
    );

    const LoadingMigrationList = () => null;
    return (
      <div className="modal-card" onClick={this.props.onClose}>
        <div
          className="modal-content"
          onClick={event => event.stopPropagation()}
        >
          <div className="modal-header">
            <h4 className="modal-title">{t("migrations_panel_title")}</h4>
          </div>
          <div className="modal-body">
            <p className="mb-3">{t("migrations_panel_abstract")}</p>
            {!migrations ? (
              <LoadingMigrationList />
            ) : Object.keys(migrations).length === 0 ? (
              <EmptyDelegateList />
            ) : (
              <MigrationList />
            )}
            <div className="d-flex mt-5" style={{ justifyContent: "center" }}>
              <button
                className="btn btn-primary"
                onClick={() => this.startMigration()}
                disabled={selectedForMigration.length === 0}
              >
                {t("migrations_panel_start_migration")}
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={this.props.onClose} className="btn btn-primary">
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
export default withNamespaces(["subscription_migrations", "modal"])(
  MigrationsPanel
);
