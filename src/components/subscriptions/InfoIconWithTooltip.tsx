import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import MdInfoOutline from "react-icons/lib/md/info-outline";
import { Popover, PopoverBody } from "reactstrap";

import "./InfoIconWithTooltip.css";

type OwnProps = {
  content: string;
};
type Props = WithNamespaces & OwnProps;

type InfoIconWithTooltipState = {
  isTooltipOpen: boolean;
};

/**
 * Component used for displaying an active info icon that trigger a tooltip content.
 */
class InfoIconWithTooltip extends Component<Props, InfoIconWithTooltipState> {
  public state: InfoIconWithTooltipState = {
    isTooltipOpen: false
  };

  public render() {
    const { content } = this.props;
    const { isTooltipOpen } = this.state;

    const toggleHeaderInfo = () => {
      this.setState({ isTooltipOpen: !isTooltipOpen });
    };

    return (
      <span className="info-icon--info pointer">
        <MdInfoOutline id="info" size="1.3em" onClick={toggleHeaderInfo} />
        <Popover
          style={{
            fontSize: "14px",
            fontWeight: 600,
            textAlign: "center"
          }}
          placement="top"
          target="info"
          isOpen={isTooltipOpen}
          toggle={toggleHeaderInfo}
        >
          <PopoverBody>{content}</PopoverBody>
        </Popover>
      </span>
    );
  }
}

export default withNamespaces("profile")(InfoIconWithTooltip);
