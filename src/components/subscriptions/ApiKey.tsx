import { Button } from "design-react-kit";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import FaAngleDown from "react-icons/lib/fa/angle-down";
import FaAngleUp from "react-icons/lib/fa/angle-up";
import MdInfoOutline from "react-icons/lib/md/info-outline";

import { Collapse, Popover, PopoverBody } from "reactstrap";
import { SubscriptionContract } from "../../../generated/definitions/backend/SubscriptionContract";
import { Service } from "../../../generated/definitions/commons/Service";
import CopyToClipboard from "./CopyToClipboard";

import "./ApiKey.css";
import KeyMasker from "./KeyMasker";

type KeyType = "primary" | "secondary";
type ApiKeyHeaderContent = {
  header: string;
  content: string;
};

type OwnProps = {
  subscription: SubscriptionContract;
  service?: Service;
  headerInfo?: ApiKeyHeaderContent;
  showUseKeyAction: boolean;
  additionalClass?: string;
  additionalStyle?: React.CSSProperties;
  collapseSecondaryKey: boolean;
  maskedKeys: {
    primary: boolean;
    secondary: boolean;
  };
  onRegenerateKey: (keyType: KeyType, subscriptionId: string) => void;
  onCollapseChange: (isCollapsed: boolean) => void;
  onMaskChange: (key: KeyType, masked: boolean) => void;
};
type Props = WithNamespaces & OwnProps;

type ApiKeyState = {
  isHeaderTooltipOpen: boolean;
};
class ApiKey extends Component<Props, ApiKeyState> {
  public state: ApiKeyState = {
    isHeaderTooltipOpen: false
  };

  private onSetKey = (serviceKey: string, service: Service) => () => {
    sessionStorage.setItem("serviceKey", serviceKey);
    sessionStorage.setItem("service", JSON.stringify(service));
    window.location.replace("/compose");
  };

  private onRegenerateKey = (
    keyType: KeyType,
    subscriptionId?: string
  ) => async () => {
    if (subscriptionId) {
      return this.props.onRegenerateKey(keyType, subscriptionId);
    }
  };

  public render() {
    const {
      t,
      subscription,
      service,
      headerInfo,
      collapseSecondaryKey,
      maskedKeys
    } = this.props;
    const { isHeaderTooltipOpen } = this.state;

    const toggleHeaderInfo = () => {
      this.setState({ isHeaderTooltipOpen: !isHeaderTooltipOpen });
    };

    const KeyRow = (keyType: KeyType, keyValue: string, baseClass: string) => (
      <div className={baseClass}>
        <div className="col-auto m-auto">
          <KeyMasker
            label={`${keyType}_key`}
            value={keyValue}
            masked={maskedKeys[keyType]}
            onMaskChange={value => this.props.onMaskChange(keyType, value)}
          />
          <span className="mx-2">
            <CopyToClipboard
              text={
                subscription[
                  `${keyType}Key` as keyof typeof subscription
                ] as string
              }
            />
          </span>
        </div>
        <div className="col">
          <Button
            color="primary"
            size="xs"
            className="mr-1 px-3"
            outline={true}
            disabled={subscription.state !== "active"}
            onClick={this.onRegenerateKey(keyType, subscription.name)}
          >
            {t("regenerate")}
          </Button>
          {this.props.showUseKeyAction && service ? (
            <Button
              color="primary"
              size="xs"
              className="mx-1 px-3"
              disabled={!service || subscription.state !== "active"}
              onClick={this.onSetKey(
                subscription[
                  `${keyType}Key` as keyof typeof subscription
                ] as string,
                service
              )}
            >
              {t("use")}
            </Button>
          ) : null}
        </div>
        {keyType === "primary" ? (
          <div className="col-auto text-right">
            <Button
              className="py-0"
              color="link"
              onClick={() => this.props.onCollapseChange(!collapseSecondaryKey)}
              aria-expanded={!collapseSecondaryKey}
            >
              {collapseSecondaryKey ? (
                <FaAngleDown size="2em" />
              ) : (
                <FaAngleUp size="2em" />
              )}
            </Button>
          </div>
        ) : null}
      </div>
    );

    return subscription && subscription.primaryKey ? (
      <div
        className={`api-key ${this.props.additionalClass}`}
        style={this.props.additionalStyle}
      >
        {headerInfo ? (
          <div className="row">
            <div
              className="col pb-2"
              style={{ fontSize: "18px", fontWeight: 700 }}
            >
              {headerInfo.header}
              <span className="api-key--info pointer">
                <MdInfoOutline
                  id="info"
                  size="1.3em"
                  onClick={toggleHeaderInfo}
                />
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
                  <PopoverBody>{headerInfo.content}</PopoverBody>
                </Popover>
              </span>
            </div>
          </div>
        ) : null}
        {KeyRow("primary", subscription.primaryKey, "row")}
        <Collapse isOpen={!collapseSecondaryKey}>
          {KeyRow("secondary", subscription.secondaryKey, "row mt-2")}
        </Collapse>
      </div>
    ) : null;
  }
}

export default withNamespaces("profile")(ApiKey);
