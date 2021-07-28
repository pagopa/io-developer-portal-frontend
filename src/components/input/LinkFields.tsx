import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";

import React, { ChangeEvent, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  service_metadata?: ServiceMetadata;
  isApiAdmin: boolean;
  showError: boolean;
  errors: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onBlur: (
    prop: keyof ServiceMetadata
  ) => (event: FocusEvent<HTMLSelectElement | HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

/**
 * Array containing all keys of ServiceMetadata, and for each of them an input is created inside the form.
 * See https://github.com/pagopa/io-developer-portal-frontend/pull/139
 */
const MetadataKeys = ServiceMetadata.type.types.reduce(
  (p, e) => [
    ...p,
    ...(Object.keys(e.props) as ReadonlyArray<keyof ServiceMetadata>)
  ],
  [] as ReadonlyArray<keyof ServiceMetadata>
);

const LinkFields = ({
  service_metadata,
  onChange,
  onBlur,
  errors,
  t
}: Props) => {
  const linkFields = MetadataKeys.filter(
    elem =>
      elem === "app_ios" ||
      elem === "app_android" ||
      elem === "web_url" ||
      elem === "tos_url" ||
      elem === "privacy_url"
  );

  const renderFields = (fields: ReadonlyArray<keyof ServiceMetadata>) => {
    return fields.map((k, i) => {
      return (
        <div key={i}>
          <label className={errors[k] ? "mb0 error-text" : "mb0"}>{t(k)}</label>
          <input
            name={k}
            type="text"
            defaultValue={service_metadata && service_metadata[k]}
            onChange={onChange}
            onBlur={onBlur(k)}
            className={errors[k] ? "mb4 error" : "mb4"}
          />
        </div>
      );
    });
  };

  return <React.Fragment>{renderFields(linkFields)}</React.Fragment>;
};

export default withNamespaces("service")(LinkFields);
