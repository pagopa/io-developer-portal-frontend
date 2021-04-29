import React, { ChangeEvent, FocusEvent } from "react";
import * as ts from "io-ts";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import { Option } from 'fp-ts/lib/Option';
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";
import { ValidUrl } from "italia-ts-commons/lib/url";
import { IEmailStringTag, INonEmptyStringTag, IPatternStringTag} from "italia-ts-commons/lib/strings";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { Alert, Input } from "reactstrap";
import { LIMITS } from "../../utils/constants";
import MarkdownEditor from "./MarkdownEditor";
import { FieldsValidatorType, getValidator } from "../../utils/validators";
import ContactInput from "./ContactInput";


type OwnProps = {
  service_metadata?: ServiceMetadata;
  isApiAdmin: boolean;
  originalServiceIsVisible: boolean;
  errors: { [key: string]: string },
  onChange: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onBlur: (type: Option<FieldsValidatorType>) => (event: FocusEvent<HTMLSelectElement | HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

type validFields = "scope" | "description" | "web_url" | "app_ios" | "app_android" | "tos_url" | "privacy_url" | "address" | "phone" | "email" | "pec" | "cta" | "token_name" | "support_url"

const { MARKDOWN } = LIMITS;

/**
 * Array containing all keys of ServiceMetadata, and for each of them an input is created inside the form.
 * See https://github.com/pagopa/io-developer-portal-frontend/pull/139
 */
export const MetadataKeys = ServiceMetadata.type.types.reduce(
  (p, e) => [...p, ...Object.keys(e.props) as (keyof ServiceMetadata)[]],
  [] as readonly (keyof ServiceMetadata)[]
);

export const SortedMetadata: readonly (keyof ServiceMetadata)[] = [
  "description",
  "cta",
  ...MetadataKeys.filter(
    k => !["description", "scope", "cta", "token_name"].includes(k)
  ),
  "token_name",
  "scope"
];

type MetadataFields = keyof ServiceMetadata
type MappedMetadataFields = {
  [P in MetadataFields]: P
}
const contactFields: Partial<MappedMetadataFields> = {
  support_url: "support_url",
  phone: "phone",
  pec: "pec",
  email: "email"
}

/*type Contact_fields = Pick<MappedMetadataFields, "phone" | "pec" | "email" | "support_url">
type MappedContactFields<Contact_fields> = {
  [P in keyof Contact_fields]: Contact_fields[P]
}
const b: MappedContactFields<Contact_fields> = "phone"
*/
const MetadataInput = ({
  service_metadata,
  onChange,
  onBlur,
  isApiAdmin,
  originalServiceIsVisible,
  errors,
  t
}: Props) => {


  const contact_fields = MetadataKeys.filter(elem => elem === 'phone'
    || elem === 'pec' || elem === 'email' || elem === 'support_url')
  const app_fields = MetadataKeys.filter(elem => elem === 'app_ios'
    || elem === 'app_android')
  const address_tos_privacyurl = MetadataKeys.filter(elem => elem === 'tos_url'
    || elem === 'address' || elem === 'privacy_url')

  const renderFields = (fields: validFields[], option?: {} ) => {
    const more = option ? option : {}
    return fields.map((k, i) =>
      {
        return (
          <div key={i}>
          <label className="m-0">{t(k)}</label>
            <input
              name={k}
              type="text"
              defaultValue={Object(service_metadata)[k]}
              onChange={onChange}
              onBlur={onBlur(getValidator(k))}
              className={errors[k] ? "mb4 error" : "mb4"}
              {...more}
            />
            {errors[k] && <Alert color="danger" key={i}>Errore {JSON.stringify(errors[k])}</Alert>}
          </div>
        )
      }
      )

  }

  const contactFields = () => {
    return(
      <ContactInput
        name="contacts"
        elem={contact_fields}
        errors={errors}
        service_metadata={service_metadata ? {
          phone: service_metadata.phone || '',
          pec: service_metadata.pec || '',
          email: service_metadata.email || '',
          support_url: service_metadata.support_url || ''

        } : {}}
        onBlur={onBlur}
      />
    )
  }

  const scopeField = () => {
    return SortedMetadata.filter(elem => elem === 'scope').map((elem, i) =>
      {
        return (
          <div key={i}>
            <label className="m-0">{t("scope")}*</label>
            <select
              name="scope"
              value={service_metadata ? service_metadata.scope : undefined}
              className="form-control mb-4"
              onChange={onChange}
              disabled={originalServiceIsVisible && !isApiAdmin}
              onBlur={onBlur(getValidator("scope"))}
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
        )
      }
      )
  }

  const descriptionField = () => {
    return SortedMetadata.filter(elem => elem === 'description').map((elem, i) =>
      {
        return (
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
        )
      }
      )
  }

  const ctaField = () => {
    return SortedMetadata.filter(elem => elem === 'cta').map((k, i) =>
      {
        return (
          <div key={i}>
            <label className="m-0">{t(k)}</label>
            <Input
              defaultValue={
                service_metadata && service_metadata.cta
                  ? service_metadata.cta
                  : ""
              }
              onChange={onChange}
              onBlur={onBlur(getValidator("cta"))}
              name={k}
              type="textarea"
              rows="15"
              className="mb-4 h-100 flex-row"
            />
          </div>
        )
      }
      )
  }

  // console.log('Oggetto degli errori trasmetto al Metadata Component', errors);
  return (
    /* - Input text: all metadata except 'scope', 'descrition' and 'cta'
     * - Text area: 'descrition' according to MarkdownEditor and 'cta' as a simple text area
     * - Select: 'scope' that is an enumeration
     */
    <div>
      {descriptionField()}
      {ctaField()}
      {renderFields(['token_name'], {disabled: !isApiAdmin})}
      {renderFields(app_fields)}
      {renderFields(address_tos_privacyurl)}
      {contactFields()}
      {scopeField()}
    </div>
  );
};

export default withNamespaces("service")(MetadataInput);
