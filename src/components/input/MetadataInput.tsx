import React, { ChangeEvent } from "react";
import * as ts from "io-ts";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";

import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";

import { WithNamespaces, withNamespaces } from "react-i18next";
import { Alert, Input } from "reactstrap";
import { LIMITS } from "../../utils/constants";
import MarkdownEditor from "./MarkdownEditor";

type OwnProps = {
  service_metadata?: ServiceMetadata;
  isApiAdmin: boolean;
  originalServiceIsVisible: boolean;
  errors: { [key: string]: string },
  onChange: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onBlur: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

const { MARKDOWN } = LIMITS;

/**
 * Array containing all keys of ServiceMetadata, and for each of them an input is created inside the form.
 * See https://github.com/pagopa/io-developer-portal-frontend/pull/139
 */
export const MetadataKeys = ServiceMetadata.type.types.reduce(
  (p, e) => [...p, ...Object.keys(e.props)],
  [] as readonly string[]
);

export const SortedMetadata: readonly string[] = [
  "description",
  "cta",
  ...MetadataKeys.filter(
    k => !["description", "scope", "cta", "token_name"].includes(k)
  ),
  "token_name",
  "scope"
];

const MetadataInput = ({
  service_metadata,
  onChange,
  onBlur,
  isApiAdmin,
  originalServiceIsVisible,
  errors,
  t
}: Props) => {
  console.log('Oggetto degli errori trasmetto al Metadata Component', errors);
  return (
    /* - Input text: all metadata except 'scope', 'descrition' and 'cta'
     * - Text area: 'descrition' according to MarkdownEditor and 'cta' as a simple text area
     * - Select: 'scope' that is an enumeration
     */
    <div>
      {SortedMetadata.map((k, i) =>
        k === "scope" ? (
          <div key={i}>
            <label className="m-0">{t("scope")}*</label>
            <select
              name="scope"
              value={service_metadata ? service_metadata.scope : undefined}
              className="form-control mb-4"
              onChange={onChange}
              disabled={originalServiceIsVisible && !isApiAdmin}
              onBlur={onBlur}
            >
              <option
                key={ServiceScopeEnum.NATIONAL}
                value={ServiceScopeEnum.NATIONAL}
              >
                {ServiceScopeEnum.NATIONAL}
              </option>
              <option
                key={ServiceScopeEnum.LOCAL}
                value={ServiceScopeEnum.LOCAL}
              >
                {ServiceScopeEnum.LOCAL}
              </option>
            </select>
          </div>
        ) : k === "description" ? (
          <MarkdownEditor
            markdown={
              service_metadata && service_metadata.description
                ? service_metadata.description
                : ""
            }
            name="description"
            markdownLength={[MARKDOWN.MIN, MARKDOWN.MAX]}
            isMarkdownValid={true}
            onChangeMarkdown={onChange}
            key={i}
          />
        ) : k === "cta" ? (
          <div key={i}>
            <label className="m-0">{t(k)}</label>
            <Input
              defaultValue={
                service_metadata && service_metadata.cta
                  ? service_metadata.cta
                  : ""
              }
              onChange={onChange}
              onBlur={onBlur}
              name={k}
              type="textarea"
              rows="15"
              className="mb-4 h-100 flex-row"
            />
          </div>
        ) : k === "token_name" ? (
          <div key={i}>
            <label className="m-0">{t(k)}</label>
            <input
              name={k}
              type="text"
              defaultValue={Object(service_metadata)[k]}
              onChange={onChange}
              onBlur={onBlur}
              className="mb-4"
              disabled={!isApiAdmin}
            />
          </div>
        ) : (
          <div key={i}>
            {errors[k] && <Alert color="danger" key={i}>Errore {JSON.stringify(errors[k])}</Alert>}
            <label className="m-0">{t(k)}</label>
            <input
              name={k}
              type="text"
              defaultValue={Object(service_metadata)[k]}
              onChange={onChange}
              onBlur={onBlur}
              className={errors[k] ? "mb4 error" : "mb4"}
            />
          </div>
        )
      )}
    </div>
  );
};

export default withNamespaces("service")(MetadataInput);
