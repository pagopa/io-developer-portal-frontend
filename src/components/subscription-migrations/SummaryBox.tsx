import React from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";
import LatestMigrationsPanel from "./LatestMigrationsPanel";

type OwnProps = {
  onSubmitHandler: () => void;
};

type Props = WithNamespaces & OwnProps;

const SummaryBox = ({ onSubmitHandler, t }: Props) => {
  return (
    <div className="">
      <div className="">
        <h4>{t("migrations_summary_title")}</h4>
        <p>{t("migrations_summary_abstract")}</p>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" onClick={onSubmitHandler}>
          {t("open_migrations_panel")}
        </button>
      </div>

      <div className="mt-4">
        <h4>{t("migrations_summary_latest")}</h4>
        <p>{t("migrations_summary_latest_abstract")}</p>
      </div>

      <div className="mt-3">
        <span className="pt-3 pb-3">
          <LatestMigrationsPanel />
        </span>
      </div>
    </div>
  );
};

export default withNamespaces("subscription_migrations")(SummaryBox);
