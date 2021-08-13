import { Service } from "io-functions-commons/dist/generated/definitions/Service";

import React, { FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  service: Service;
  isApiAdmin: boolean;
  showError: boolean;
  errors: Record<string, string>;
  onBlur: (
    prop: keyof Service
  ) => (event: FocusEvent<HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

const SecurityFields = ({ service, onBlur, isApiAdmin, errors, t }: Props) => {
  const renderFields = () => {
    return (
      <React.Fragment>
        <div>
          <label
            className={errors[`authorized_cidrs`] ? "mb0 error-text" : "mb0"}
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
            className={errors[`authorized_cidrs`] ? "mb4 error" : "mb4"}
          />
        </div>
        {isApiAdmin && (
          <div>
            <label
              className={
                errors[`authorized_recipients`] ? "mb0 error-text" : "mb0"
              }
            >
              {t("authorized_recipients")}*
            </label>
            <input
              name="authorized_recipients"
              type="text"
              defaultValue={service.authorized_recipients.join(";")}
              onBlur={onBlur("authorized_recipients")}
              className={errors[`authorized_recipients`] ? "mb4 error" : "mb4"}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  return <React.Fragment>{renderFields()}</React.Fragment>;
};

export default withNamespaces("service")(SecurityFields);
