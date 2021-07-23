import { Service } from "io-functions-commons/dist/generated/definitions/Service";

import React, { ChangeEvent, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  service: Service;
  isApiAdmin: boolean;
  showError: boolean;
  errors: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (
    prop: keyof Service
  ) => (event: FocusEvent<HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

const SecurityFields = ({
  service,
  onChange,
  onBlur,
  isApiAdmin,
  showError,
  errors,
  t
}: Props) => {
  const renderFields = () => {
    return (
      <React.Fragment>
        <div>
          <label
            className={
              errors[`authorized_cidrs`] && showError ? "mb0 error-text" : "mb0"
            }
          >
            {t("authorized_ips")}
          </label>
          <p>
            <small>{t("example_authorized_ips")}</small>
          </p>
          <input
            name="authorized_cidrs"
            type="text"
            defaultValue={service.authorized_cidrs.join(";")}
            onBlur={onBlur("authorized_cidrs")}
            className={
              errors[`authorized_cidrs`] && showError ? "mb4 error" : "mb4"
            }
          />
        </div>
        {isApiAdmin && (
          <div>
            <label
              className={
                errors[`authorized_recipients`] && showError
                  ? "mb0 error-text"
                  : "mb0"
              }
            >
              {t("authorized_recipients")}*
            </label>
            <input
              name="authorized_recipients"
              type="text"
              defaultValue={service.authorized_recipients.join(";")}
              onBlur={onBlur("authorized_recipients")}
              className={
                errors[`authorized_recipients`] && showError
                  ? "mb4 error"
                  : "mb4"
              }
            />
          </div>
        )}
        {isApiAdmin && (
          <div>
            <label
              className={
                errors[`max_allowed_payment_amount`] && showError
                  ? "mb0 error-text"
                  : "mb0"
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
                errors[`max_allowed_payment_amount`] && showError
                  ? "mb4 error"
                  : "mb4"
              }
            />
          </div>
        )}
        {isApiAdmin && (
          <div>
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

export default withNamespaces("service")(SecurityFields);
