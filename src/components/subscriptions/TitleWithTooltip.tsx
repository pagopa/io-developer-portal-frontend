import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import MdInfoOutline from "react-icons/lib/md/info-outline";
import { Popover, PopoverBody } from "reactstrap";

type OwnProps = {
  title: string;
  tooltipContent: string;
};
type Props = WithNamespaces & OwnProps;

type TitleWithTooltipState = {
  isHeaderTooltipOpen: boolean;
};

/**
 * Component used for displaying a title text with an active icon that trigger a tooltip content.
 */
class TitleWithTooltip extends Component<Props, TitleWithTooltipState> {
  public state: TitleWithTooltipState = {
    isHeaderTooltipOpen: false
  };

  public render() {
    const { title, tooltipContent } = this.props;
    const { isHeaderTooltipOpen } = this.state;

    const toggleHeaderInfo = () => {
      this.setState({ isHeaderTooltipOpen: !isHeaderTooltipOpen });
    };

    return (
      <div className="row">
        <div className="col pb-2" style={{ fontSize: "18px", fontWeight: 700 }}>
          {title}
          <span className="api-key--info pointer">
            <MdInfoOutline id="info" size="1.3em" onClick={toggleHeaderInfo} />
            <Popover
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textAlign: "center"
              }}
              placement="top"
              target="info"
              isOpen={isHeaderTooltipOpen}
              toggle={toggleHeaderInfo}
            >
              <PopoverBody>{tooltipContent}</PopoverBody>
            </Popover>
          </span>
        </div>
      </div>
    );
  }
}

export default withNamespaces("profile")(TitleWithTooltip);
