import React, { Component, Fragment } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  showMore: boolean;
  onClick: () => void;
};
type Props = WithNamespaces & OwnProps;

type ToggleServiceInfoState = {
  showMore: boolean;
};
class ToggleServiceInfo extends Component<Props, ToggleServiceInfoState> {
  public state: ToggleServiceInfoState = {
    showMore: false
  };

  public componentDidMount(): void {
    this.setState({ showMore: this.props.showMore });
  }

  public render() {
    const { t } = this.props;

    return (
      <Fragment>
        <button
          onClick={() => {
            this.props.onClick();
            this.setState({ showMore: !this.state.showMore });
          }}
          type="button"
          className="btn btn-link pl-0"
        >
          {this.state.showMore ? t("less_info") : t("more_info")}
        </button>
      </Fragment>
    );
  }
}

export default withNamespaces("profile")(ToggleServiceInfo);
