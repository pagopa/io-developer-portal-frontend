import { Alert } from "design-react-kit";
import { none, Option } from "fp-ts/lib/Option";
import { fromPredicate } from "fp-ts/lib/Option";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import React, { Component, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  name: string;
  elem: ReadonlyArray<keyof ServiceMetadata>;
  errors: Record<string, string>;
  serviceMetadata: Partial<ServiceMetadata>;
  onBlur: (
    prop: keyof ServiceMetadata
  ) => (event: FocusEvent<HTMLSelectElement | HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;
type ContactsFields = "pec" | "phone" | "email" | "string";
type ContactInMetadata = { [P in ContactsFields]?: string };
class ContactInput extends Component<Props> {
  public state: {
    metadata: ContactInMetadata;
    error: Option<string>;
  } = {
    metadata: {},
    error: none
  };

  public componentDidMount() {
    this.setState({
      metadata: this.props.serviceMetadata
    });
  }

  private async handlerOnBlurInputData(
    event: FocusEvent<HTMLInputElement>,
    inputField: keyof ServiceMetadata
  ) {
    // Validate input data
    this.props.onBlur(inputField)(event);

    this.setState(
      {
        metadata: {
          ...this.state.metadata,
          [inputField]: event.target.value
        }
      },
      () => {
        // Check if exist at least one field on metadata object, if so I'll return a none otherwise a some
        this.setState({
          error: fromPredicate<ReadonlyArray<ContactsFields>>(
            _ => _.length === 0
          )(Object.keys(this.state.metadata).filter(
            el => this.state.metadata[el as ContactsFields]
          ) as ReadonlyArray<ContactsFields>).map(_ =>
            this.props.t("contact_fields_message")
          )
        });
      }
    );
  }

  public render() {
    const { elem, errors, serviceMetadata, t } = this.props;
    const { error } = this.state;
    return (
      <div className="">
        {error.isSome() && <Alert color="warning">{error.value}</Alert>}
        {elem &&
          elem.map((k, i) => {
            return (
              <div key={i}>
                <label className={errors[k] ? "mb0 error-text" : "mb0"}>
                  {t(k)}
                </label>
                <input
                  name={k}
                  type="text"
                  defaultValue={serviceMetadata[k]}
                  onBlur={e => this.handlerOnBlurInputData(e, k)}
                  className={errors[k] ? "mb4 error" : "mb4"}
                />
                {/*errors[k] && (
                  <Alert color="danger" key={i}>
                    {JSON.stringify(errors[k])}
                  </Alert>
                )*/}
              </div>
            );
          })}
      </div>
    );
  }
}
export default withNamespaces("service")(ContactInput);
