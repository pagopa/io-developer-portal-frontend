import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import MdContentCopy from "react-icons/lib/md/content-copy";
import MdDone from "react-icons/lib/md/done";

type OwnProps = {
  text: string;
};
type Props = WithNamespaces & OwnProps;

type CopyToClipboardState = {
  copied: boolean;
};
class CopyToClipboard extends Component<Props, CopyToClipboardState> {
  public state: CopyToClipboardState = {
    copied: false
  };

  public render() {
    const { text } = this.props;
    const { copied } = this.state;

    const setCopiedState = () => {
      void navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      const timer = setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
      return () => clearTimeout(timer);
    };

    return (
      <a style={{ cursor: "pointer" }} onClick={setCopiedState}>
        {copied ? <MdDone size="1.3em" /> : <MdContentCopy size="1.3em" />}
      </a>
    );
  }
}

export default withNamespaces("profile")(CopyToClipboard);
