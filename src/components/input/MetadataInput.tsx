import React, { ChangeEvent } from "react";

import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";

import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  service: Service;
  isApiAdmin: boolean;
  onChangeText: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeSelect: (event: ChangeEvent<HTMLSelectElement>) => void;
};

type Props = WithNamespaces & OwnProps;

const MetadataInput = ({
  service: { service_metadata },
  onChangeText,
  onChangeSelect,
  isApiAdmin,
  t
}: Props) => {
  return isApiAdmin && service_metadata ? (
    // All input text Metadata (except 'scope' that is an enumeration)
    <div>
      {Object.keys(service_metadata)
        .filter(k => k !== "scope")
        .map((k, i) => (
          <div key={i}>
            <label className="m-0">{t(k)}</label>
            <input
              name={k}
              type="text"
              defaultValue={Reflect.get(service_metadata, k)}
              onChange={onChangeText}
              className="mb-4"
            />
          </div>
        ))}
      <div>
        <label className="m-0">{t("scope")} </label>
        <select
          name="scope"
          value={service_metadata.scope}
          className="mb-4"
          onChange={onChangeSelect}
        >
          <option
            aria-selected="true"
            key={ServiceScopeEnum.NATIONAL}
            value={ServiceScopeEnum.NATIONAL}
          >
            {ServiceScopeEnum.NATIONAL}
          </option>
          <option
            aria-selected="true"
            key={ServiceScopeEnum.LOCAL}
            value={ServiceScopeEnum.LOCAL}
          >
            {ServiceScopeEnum.LOCAL}
          </option>
        </select>
      </div>
    </div>
  ) : null;
};

export default withNamespaces("service")(MetadataInput);
