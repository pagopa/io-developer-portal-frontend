import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";

import React, { ChangeEvent, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  service: Service;
  isApiAdmin: boolean;
  showError: boolean;
  errors: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onBlur: (
    prop: keyof Service
  ) => (event: FocusEvent<HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

const AdminFields = ({
  service,
  onChange,
  onBlur,
  isApiAdmin,
  errors,
  t
}: Props) => {
  const renderFields = () => {
    const scope = service.service_metadata
      ? service.service_metadata.scope
      : undefined;
    return (
      <React.Fragment>
        <div>
          <label className="m-0">{t("scope")}*</label>
          <select
            style={{
              border:
                scope !== undefined && scope === "NATIONAL"
                  ? "2px solid #FF7F50"
                  : "2px solid #7FFFD4"
            }}
            name="scope"
            value={scope}
            className="form-control mb-4"
            disabled={service.is_visible && !isApiAdmin}
            onChange={onChange}
          >
            <option
              key={ServiceScopeEnum.NATIONAL}
              value={ServiceScopeEnum.NATIONAL}
            >
              {t(ServiceScopeEnum.NATIONAL.toLocaleLowerCase())}
            </option>
            <option key={ServiceScopeEnum.LOCAL} value={ServiceScopeEnum.LOCAL}>
              {t(ServiceScopeEnum.LOCAL.toLocaleLowerCase())}
            </option>
          </select>
        </div>
        {isApiAdmin && (
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
        )}
        {isApiAdmin && (
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
        )}
      </React.Fragment>
    );
  };

  return <React.Fragment>{renderFields()}</React.Fragment>;
};

export default withNamespaces("service")(AdminFields);
