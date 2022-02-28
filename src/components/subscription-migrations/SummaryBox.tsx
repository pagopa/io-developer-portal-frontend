import React from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  onSubmitHandler: () => void;
};

type Props = WithNamespaces & OwnProps;

const SummaryBox = ({ onSubmitHandler, t }: Props) => {
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
          {t("migrations_summary_latest_empty")}
        </span>
      </div>
    </div>
  );
};

export default withNamespaces("subscription_migrations")(SummaryBox);
