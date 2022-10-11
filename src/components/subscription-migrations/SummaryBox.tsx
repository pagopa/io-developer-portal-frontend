import { ProblemJson } from "@pagopa/ts-commons/lib/responses";
import { get } from "lodash";

import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { getFromBackend } from "../../utils/backend";
import DelegateItem, { Delegate } from "./DelegateItem";

type ClaimProcedureStatusResponse = {
  data: {
    COMPLETED: number;
    FAILED: number;
    INITIAL: number;
    PROCESSING: number;
  };
};
export type MigrationStatus = "done" | "doing" | "todo" | "failed";

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

type LatestMigrationsStatusListResponse = ReadonlyArray<{
  status: {
    COMPLETED: number;
    FAILED: number;
    INITIAL: number;
    PROCESSING: number;
  };
  delegate: Delegate;
}>;

type OwnProps = {
  onSubmitHandler: () => void;
};

type Props = WithNamespaces & OwnProps;

type State = {
  latest: LatestMigrationsStatusListResponse;
  latestError: string;
};

class SummaryBox extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      latest: [],
      latestError: ""
    };
  }

  public async componentDidMount() {
    // On component mount, fetch all latest migration status

    return this.loadStatus();
  }

  // Retrieve latest migration status for the current organization
  private async loadStatus() {
    const response = await getFromBackend<
      ProblemJson | LatestMigrationsStatusListResponse | undefined
    >({
      path: "subscriptions/migrations/ownership-claims/latest"
    });
    debugger;
    console.log(response);

    // Processing status: we want to show only delegate with at least one operation non in status initial
    // so we discard delegate with only initial processing service status
    const latest = Array.isArray(response)
      ? response.filter(
          data =>
            data.status.COMPLETED *
              data.status.FAILED *
              data.status.PROCESSING !==
            0
        )
      : [];

    const latestError = !Array.isArray(response)
      ? "error_migration_latest"
      : "";

    this.setState({
      latest,
      latestError
    });
  }

  render() {
    const { t, onSubmitHandler } = this.props;
    const latest = get(this.state, "latest");
    const latestError = get(this.state, "latestError");
    debugger;
    return (
      <div className="">
        <div className="">
          <h4>{t("migrations_summary_title")}</h4>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary" onClick={onSubmitHandler}>
            {t("open_migrations_panel")}
          </button>
        </div>

        <div className="mt-4">
          <span className="pt-4 pb-4">{t("disclaimer")}</span>
        </div>

        <div className="mt-4">
          <h4>{t("migrations_summary_latest")}</h4>
        </div>

        <div className="mt-3">
          <span className="pt-3 pb-3">
            {(!latest || latest.length === 0) &&
              latestError.length === 0 &&
              t("migrations_summary_latest_empty")}
            {latestError.length > 0 && t(latestError)}
            <ul>
              {latest &&
                latest.length > 0 &&
                Object.values(latest).map(data => (
                  <li>
                    <DelegateItem
                      delegate={data.delegate}
                      key={data.delegate.sourceId}
                      migrationStatus={computeMigrationStatus(data.status)}
                    />
                  </li>
                ))}
            </ul>
          </span>
        </div>
      </div>
    );
  }
}

export default withNamespaces("subscription_migrations")(SummaryBox);
