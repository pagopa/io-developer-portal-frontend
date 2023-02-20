import { Button } from "design-react-kit";
import React, { Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { FaSearch } from "react-icons/lib/fa";
import Select, { ValueType } from "react-select";

import "./SubscriptionsFilter.css";

export type OptionValueLabel = {
  value: number;
  label: string;
};

type OwnProps = {
  subscriptionsPageSizeOptions: readonly OptionValueLabel[];
  subscriptionsDefaultPageSize: OptionValueLabel;
  onSubscriptionSearchClick: (subscriptionId: string) => void;
  onSubscriptionSearchClear: () => void;
  onSubscriptionsPageSizeChange: (newPageSize: OptionValueLabel) => void;
};
type Props = WithNamespaces & OwnProps;

type SubscriptionsFilterState = {
  currentPageSize: OptionValueLabel;
  inputSearchValue: string;
  isSearchButtonDisabled: boolean;
};

class SubscriptionsFilter extends Component<Props, SubscriptionsFilterState> {
  public state: SubscriptionsFilterState = {
    currentPageSize: this.props.subscriptionsDefaultPageSize,
    inputSearchValue: "",
    isSearchButtonDisabled: true
  };

  public render() {
    const { subscriptionsPageSizeOptions, t } = this.props;
    const {
      currentPageSize,
      inputSearchValue,
      isSearchButtonDisabled
    } = this.state;

    const isValidSubscriptionId = (value: string) => {
      if (value && value.length === 26) {
        return true;
      } else {
        return false;
      }
    };

    const handleSelectChange = (
      selectedOption: ValueType<OptionValueLabel, false>
    ) => {
      if (selectedOption && selectedOption.value !== currentPageSize.value) {
        this.setState({ currentPageSize: selectedOption });
        this.props.onSubscriptionsPageSizeChange(selectedOption);
      }
    };

    const handleInputValueChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      this.setState({
        inputSearchValue: event.target.value.toUpperCase(),
        isSearchButtonDisabled: !isValidSubscriptionId(event.target.value)
      });
      if (event.target.value === "") {
        this.props.onSubscriptionSearchClear();
      }
    };

    const handleSearch = () => {
      if (inputSearchValue) {
        this.props.onSubscriptionSearchClick(inputSearchValue);
      }
    };

    const validateInput = (event: React.KeyboardEvent) => {
      const inputRegex = /[0-9a-zA-Z]+/g;
      if (!inputRegex.test(event.key)) {
        event.preventDefault();
      }
    };

    return (
      <Fragment>
        <div className="row mb-5">
          <div className="col">
            <div className="form-group subscriptions-filter--formgroup">
              <div className="input-group subscriptions-filter--inputgroup">
                <input
                  type="text"
                  className="form-control"
                  id="input-search"
                  placeholder="Cerca per ID Servizio"
                  style={{
                    height: "60px",
                    border: "1px solid rgb(204, 204, 204)",
                    borderRight: 0,
                    borderRadius: "4px 0 0 4px",
                    fontSize: "20px",
                    fontWeight: 400
                  }}
                  value={inputSearchValue}
                  onChange={handleInputValueChange}
                  maxLength={26}
                  onKeyPress={validateInput}
                />
                <div className="input-group-append">
                  <Button
                    color="primary"
                    disabled={isSearchButtonDisabled}
                    style={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: 400
                    }}
                    onClick={handleSearch}
                  >
                    <FaSearch color="primary" /> {t("Cerca")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-auto text-right">
            <div className="bootstrap-select-wrapper">
              <Select
                id="selectPageSize"
                onChange={handleSelectChange}
                options={subscriptionsPageSizeOptions}
                defaultValue={currentPageSize}
                className="subscriptions-filter--select"
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withNamespaces("profile")(SubscriptionsFilter);
