import React, { Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import MdVisibility from "react-icons/lib/md/visibility";
import MdVisibilityOff from "react-icons/lib/md/visibility-off";

type OwnProps = {
  label: string;
  value: string;
  masked: boolean;
  onMaskChange: (masked: boolean) => void;
};
type Props = WithNamespaces & OwnProps;

class KeyMasker extends Component<Props> {
  public render() {
    const { t, masked, label, value } = this.props;

    return (
      <Fragment>
        <span style={{ width: "130px", display: "inline-block" }}>
          {t(`${label}`)}
          {": "}
        </span>
        {masked ? t("key") : value}
        <span className="ml-2">
          <a
            style={{ cursor: "pointer" }}
            onClick={() => this.props.onMaskChange(!masked)}
          >
            {masked ? (
              <MdVisibility size="1.3em" />
            ) : (
              <MdVisibilityOff size="1.3em" />
            )}
          </a>
        </span>
      </Fragment>
    );
  }
}

export default withNamespaces("profile")(KeyMasker);
