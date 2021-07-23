import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";

import React, { ChangeEvent, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert, Input } from "reactstrap";

import ContactInput from "./ContactInput";

import { LIMITS } from "../../utils/constants";

import MarkdownEditor from "./MarkdownEditor";

type OwnProps = {
  service_metadata?: ServiceMetadata;
  isApiAdmin: boolean;
  errors: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onBlur: (
    prop: keyof ServiceMetadata
  ) => (event: FocusEvent<HTMLSelectElement | HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

type ValidFields = keyof ServiceMetadata;

const { MARKDOWN } = LIMITS;

/**
 * Array containing all keys of ServiceMetadata, and for each of them an input is created inside the form.
 * See https://github.com/pagopa/io-developer-portal-frontend/pull/139
 */
export const MetadataKeys = ServiceMetadata.type.types.reduce(
  (p, e) => [
    ...p,
    ...(Object.keys(e.props) as ReadonlyArray<keyof ServiceMetadata>)
  ],
  [] as ReadonlyArray<keyof ServiceMetadata>
);

export const SortedMetadata: ReadonlyArray<keyof ServiceMetadata> = [
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
  errors,
  t
}: Props) => {
  const contactfields = MetadataKeys.filter(
    elem =>
      elem === "phone" ||
      elem === "pec" ||
      elem === "email" ||
      elem === "support_url"
  );

  const otherfields = MetadataKeys.filter(
    elem =>
      elem === "app_ios" ||
      elem === "app_android" ||
      elem === "web_url" ||
      elem === "address"
  );

  const secondaryFields = MetadataKeys.filter(
    elem => elem === "tos_url" || elem === "privacy_url"
  ).sort();

  const renderFields = (fields: readonly ValidFields[], option?: {}) => {
    const more = option ? option : {};
    return fields.map((k, i) => {
      return (
        <div key={i}>
          <label className="m-0">{t(k)}</label>
          <input
            name={k}
            type="text"
            defaultValue={service_metadata && service_metadata[k]}
            onChange={onChange}
            onBlur={onBlur(k)}
            className={errors[k] ? "mb4 error" : "mb4"}
            {...more}
          />
          {errors[k] && (
            <Alert color="danger" key={i}>
              {JSON.stringify(errors[k])}
            </Alert>
          )}
        </div>
      );
    });
  };

  const contactFields = () => {
    return (
      <ContactInput
        name="contacts"
        elem={contactfields}
        errors={errors}
        serviceMetadata={
          service_metadata
            ? {
                phone: service_metadata.phone,
                pec: service_metadata.pec,
                email: service_metadata.email,
                support_url: service_metadata.support_url
              }
            : {}
        }
        onBlur={onBlur}
      />
    );
  };

  const descriptionField = () => {
    return (
      <>
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
          onBlurMarkdown={onBlur("description")}
          key={SortedMetadata.indexOf("description")}
        />
        {errors[`description`] && (
          <Alert color="danger" key="description">
            {JSON.stringify(errors[`description`])}
          </Alert>
        )}
      </>
    );
  };

  const ctaField = () => {
    return (
      <div key={SortedMetadata.indexOf("cta")}>
        <label className="m-0">{t("cta")}</label>
        <Input
          defaultValue={
            service_metadata && service_metadata.cta ? service_metadata.cta : ""
          }
          onChange={onChange}
          onBlur={onBlur("cta")}
          name={"cta"}
          type="textarea"
          rows="8"
          className="mb-4 h-100 flex-row"
        />
        {errors[`cta`] && (
          <Alert color="danger" key="cta">
            {JSON.stringify(errors[`cta`])}
          </Alert>
        )}
      </div>
    );
  };

  return (
    /* - Input text: all metadata except 'scope', 'descrition' and 'cta'
     * - Text area: 'descrition' according to MarkdownEditor and 'cta' as a simple text area
     * - Select: 'scope' that is an enumeration
     */
    <React.Fragment>
      {descriptionField()}

      {renderFields(secondaryFields)}

      {renderFields(otherfields)}
      <h5 className="mt-4">{t("contact_fields")}</h5>
      <span>{t("contact_fields_message")}</span>
      {contactFields()}

      {ctaField()}
      {renderFields(["token_name"], {
        disabled: !isApiAdmin
      })}
    </React.Fragment>
  );
};

export default withNamespaces("service")(MetadataInput);
