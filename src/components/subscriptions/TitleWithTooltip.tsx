import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import InfoIconWithTooltip from "./InfoIconWithTooltip";

type OwnProps = {
  title: string;
  tooltipContent: string;
};
type Props = WithNamespaces & OwnProps;

/**
 * Component used for displaying a title text with an active icon that trigger a tooltip content.
 */
class TitleWithTooltip extends Component<Props> {
  public render() {
    const { title, tooltipContent } = this.props;

    return (
      <div className="row">
        <div className="col pb-2" style={{ fontSize: "18px", fontWeight: 700 }}>
          {title}
          <InfoIconWithTooltip content={tooltipContent} />
        </div>
      </div>
    );
  }
}

export default withNamespaces("profile")(TitleWithTooltip);
