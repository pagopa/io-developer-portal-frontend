import { Service } from "../../../generated/definitions/commons/Service";

import React, { ChangeEvent, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { SpecialServiceCategoryEnum } from "../../../generated/definitions/api/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../generated/definitions/commons/SpecialServiceMetadata";
import { StandardServiceCategoryEnum } from "../../../generated/definitions/commons/StandardServiceCategory";
import { StandardServiceMetadata } from "../../../generated/definitions/commons/StandardServiceMetadata";

type OwnProps = {
  service: Service;
  showError: boolean;
  errors: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeMetadata: (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
  onBlur: (
    prop: keyof Service
  ) => (event: FocusEvent<HTMLInputElement>) => void;
  onBlurMetadata: (
    prop: keyof SpecialServiceMetadata
  ) => (event: FocusEvent<HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

const AdminFields = ({
  service,
  onChange,
  onChangeMetadata,
  onBlur,
  onBlurMetadata,
  errors,
  t
}: Props) => {
  const renderFields = () => {
    return (
      <React.Fragment>
        <div>
          <label
            className={
              errors[`max_allowed_payment_amount`] ? "mb0 error-text" : "mb0"
            }
          >
            {t("max_allowed_payment_amount")}
          </label>
          <input
            name="max_allowed_payment_amount"
            type="text"
            defaultValue={
              service.max_allowed_payment_amount
                ? service.max_allowed_payment_amount.toString()
                : undefined
            }
            onBlur={onBlur("max_allowed_payment_amount")}
            className={
              errors[`max_allowed_payment_amount`] ? "mb4 error" : "mb4"
            }
          />
        </div>

        <div>
          <label className="m-0">{t("category")}*</label>
          <select
            name="category"
            value={
              SpecialServiceMetadata.is(service.service_metadata) ||
              StandardServiceMetadata.is(service.service_metadata)
                ? service.service_metadata.category
                : StandardServiceCategoryEnum.STANDARD
            }
            className="form-control mb-4"
            onChange={onChangeMetadata}
          >
            <option
              key={StandardServiceCategoryEnum.STANDARD}
              value={StandardServiceCategoryEnum.STANDARD}
            >
              {t(StandardServiceCategoryEnum.STANDARD.toLocaleLowerCase())}
            </option>
            <option
              key={SpecialServiceCategoryEnum.SPECIAL}
              value={SpecialServiceCategoryEnum.SPECIAL}
            >
              {t(SpecialServiceCategoryEnum.SPECIAL.toLocaleLowerCase())}
            </option>
          </select>
        </div>

        <div>
          <label className="mb0">{t("custom_special_flow")}</label>
          <input
            name="custom_special_flow"
            type="text"
            defaultValue={
              SpecialServiceMetadata.is(service.service_metadata)
                ? service.service_metadata.custom_special_flow
                : undefined
            }
            onBlur={onBlurMetadata("custom_special_flow")}
            className="mb4"
          />
        </div>

        <div className="mt-5">
          <input
            name="is_visible"
            type="checkbox"
            defaultChecked={service.is_visible}
            onChange={onChange}
            className="mb-4 mr-2"
          />
          <label className="m-0">{t("visible_service")}</label>
        </div>
      </React.Fragment>
    );
  };

  return <React.Fragment>{renderFields()}</React.Fragment>;
};

export default withNamespaces("service")(AdminFields);
