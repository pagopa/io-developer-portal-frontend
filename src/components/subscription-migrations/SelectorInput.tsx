import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

// migration status as it matters for this component
export type MigrationStatus = "done" | "doing" | "todo" | "failed";

type OwnProps = {
  t: (key: string) => string;
  // exdcuted when an item is selected/unselected
  onSelectionChange: (selected: boolean) => void;
  selected: boolean;
  disabled?: boolean;
};

type Props = WithNamespaces & OwnProps;

class SelectorInput extends Component<Props> {
  public render() {
    const { selected, onSelectionChange, disabled } = this.props;
    return (
      <div style={{ minWidth: "1em", flex: 1, flexGrow: 0 }}>
        <input
          name="selected"
          type="checkbox"
          defaultChecked={selected}
          disabled={disabled}
          onChange={() => {
            this.setState({ selected: !selected });
            onSelectionChange(!selected);
          }}
        />
      </div>
    );
  }
}
export default withNamespaces("subscription_migrations")(SelectorInput);
