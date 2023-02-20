import React, { Component, Fragment } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import "./SubscriptionsLoader.css";

type OwnProps = {
  hasMoreSubscriptions: boolean;
  areSubscriptionsLoading: boolean;
  onClick: () => void;
};
type Props = WithNamespaces & OwnProps;

class SubscriptionsLoader extends Component<Props, never> {
  public render() {
    const { hasMoreSubscriptions, areSubscriptionsLoading, t } = this.props;

    return (
      <Fragment>
        <div className="row mt-4">
          <div className="col-md-12 text-center">
            <button
              onClick={() => this.props.onClick()}
              hidden={!hasMoreSubscriptions || areSubscriptionsLoading}
              className="btn btn-secondary btn-lg btn-block"
            >
              {t("load_more_services")}
            </button>
            <div
              className={
                areSubscriptionsLoading
                  ? "progress subscriptions-loader--progess"
                  : "subscriptions-loader--progess-hidden"
              }
              style={areSubscriptionsLoading ? { height: "56px" } : undefined}
            >
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: "100%" }}
              >
                {t("loading_services")}
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withNamespaces("profile")(SubscriptionsLoader);
