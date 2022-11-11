import { get } from "lodash";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { getFromBackend, postToBackend } from "../../utils/backend";
import "../modal/Modal.css";
import DelegateItem, { MigrationStatus } from "./DelegateItem";
import SelectorInput from "./SelectorInput";

type FinishReason = "cancel" | "done" | "error";

type OwnProps = {
  t: (key: string) => string;
  // executed when this panel's job is over
  onFinish: (reason: FinishReason) => void;
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
  disabled: boolean;
};
class MigrationsPanel extends Component<Props, State> {
  public async componentDidMount() {
    // On component mount, fetch all delegates and the status if their migrations
    return this.loadMigrations();
  }

  // claim owneship for selected items
  private async claimOwnership() {
    const selectedForMigration = get(this.state, "selectedForMigration");
    try {
      await Promise.all(
        selectedForMigration.map(id =>
          postToBackend({
            path: `subscriptions/migrations/ownership-claims/${id}`,
            options: {}
          })
        )
      );
      this.setState({ selectedForMigration: [] });
      this.props.onFinish("done");
    } catch (error) {
      // as some migrations might be successfully claimed, it's better to reset the state
      void this.loadMigrations();
      this.props.onFinish("error");
    }
  }

  // Retrieve migration infos for the current organization
  private async loadMigrations() {
    const { delegates } = await getFromBackend<DelegateListResponse>({
      path: "subscriptions/migrations/delegates"
    });

    const listOfMigrations: readonly MigrationItem[] = await Promise.all(
      delegates.map(async delegate => ({
        ...delegate,
        status: await fetchMigrationStatus(delegate.sourceId)
      }))
    );

    this.setState({ migrations: listToRecord(listOfMigrations, "sourceId") });
  }

  public render() {
    const { t } = this.props;
    const migrations = get(this.state, "migrations");
    const selectedForMigration = get(
      this.state,
      "selectedForMigration",
      [] as readonly string[]
    );
    const disabled =
      get(this.state, "disabled", false) || selectedForMigration.length === 0;

    const LoadingMigrationList = () => null;

    const EmptyMigrationList = () => (
      <div>
        <span>{t("migrations_panel_list_empty")}</span>
      </div>
    );

    const MigrationList = () => (
      <>
        <div>
          {migrations &&
            Object.values(migrations)
              .map(({ status, ...e }) => ({
                ...e,
                status: computeMigrationStatus(status)
              }))
              .map(d => (
                <div
                  key={d.sourceId}
                  className="d-flex mt-1"
                  style={{ gap: "10px" }}
                >
                  <SelectorInput
                    onSelectionChange={selected => {
                      if (selected) {
                        this.setState({
                          selectedForMigration: [
                            ...selectedForMigration,
                            d.sourceId
                          ]
                        });
                      } else {
                        this.setState({
                          selectedForMigration: selectedForMigration.filter(
                            e => e !== d.sourceId
                          )
                        });
                      }
                    }}
                    selected={selectedForMigration.includes(d.sourceId)}
                    disabled={d.status !== "todo" && d.status !== "failed"}
                  />
                  <DelegateItem delegate={d} migrationStatus={d.status} />
                </div>
              ))}
        </div>
      </>
    );

    return (
      <>
        <div
          className="modal-card"
          onClick={() => this.props.onFinish("cancel")}
        >
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
                <EmptyMigrationList />
              ) : (
                <MigrationList />
              )}
              <div className="d-flex mt-5" style={{ justifyContent: "center" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    this.setState({ disabled: true });
                    void this.claimOwnership().finally(() =>
                      this.setState({ disabled: false })
                    );
                  }}
                  disabled={disabled}
                >
                  {t("migrations_panel_start_migration")}
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => this.props.onFinish("cancel")}
                className="btn btn-secondary"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default withNamespaces(["subscription_migrations", "modal"])(
  MigrationsPanel
);
