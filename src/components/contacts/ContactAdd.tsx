import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { InputGroup, InputGroupAddon } from "design-react-kit";
import MaskedInput from "react-text-mask";

import { LIMITS } from "../../utils/constants";
const { CODE } = LIMITS;

type Props = {
  code: any;
  codeMask: any;
  isCodeValid: any;
  onInputCode: any;
  onInputAdd?: any;
};
type ContactAddProps = WithNamespaces & Props;

class ContactAdd extends Component<ContactAddProps, never> {
  public render() {
    const { code, codeMask, isCodeValid, onInputCode, onInputAdd } = this.props;
    const { t } = this.props;

    return (
      <InputGroup className="pb-3">
        <MaskedInput
          type="text"
          autoFocus={true}
          className="form-control shadow-none"
          placeholder={t("fiscal_code")}
          aria-label={t("fiscal_code")}
          minLength={CODE.MIN}
          maxLength={CODE.MAX}
          value={code}
          guide={false}
          mask={codeMask}
          onChange={onInputCode}
        />

        {onInputAdd && (
          <InputGroupAddon
            addonType="append"
            onClick={() => isCodeValid && onInputAdd()}
          >
            <span
              className={`border-0 input-group-text it-close icon-rotate-45deg ${
                isCodeValid ? "cursor-pointer" : ""
              }`}
            />
          </InputGroupAddon>
        )}
        {code && !isCodeValid && (
          <div className="invalid-feedback d-block">
            {t("validation:fiscal_code", { max: CODE.MAX })}
          </div>
        )}
      </InputGroup>
    );
  }
}

export default withNamespaces(["contacts", "validation"])(ContactAdd);
