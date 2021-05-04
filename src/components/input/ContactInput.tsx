import { Alert } from "design-react-kit";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import React, { Component, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";

type OwnProps = {
  name: string;
  elem: ReadonlyArray<keyof ServiceMetadata>;
  errors: Record<string, string>;
  service_metadata: Partial<ServiceMetadata>;
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
    error: string;
  } = {
    metadata: {},
    error: ""
  };

  public componentDidMount() {
    this.setState({
      metadata: this.props.service_metadata
    });
  }

  private async handlerOnBlurInputData(
    event: FocusEvent<HTMLInputElement>,
    inputField: keyof ServiceMetadata
  ) {
    // Validate input data
    this.props.onBlur(inputField)(event);

    this.setState({
      metadata: {
        ...this.state.metadata,
        [inputField]: event.target.value
      }
    });

    this.setState({
      error: Object.keys(this.state.metadata)
        .filter(el => this.state.metadata[el as ContactsFields])
        .reduce(() => "", "ricordati di inserire almeno un contatto!")
    });
  }

  public render() {
    const { elem, errors, service_metadata, t } = this.props;
    const { error } = this.state;
    return (
      <div>
        {error.length > 0 && (
          <Alert color="warning">Attenzione {JSON.stringify(error)}</Alert>
        )}
        {elem &&
          elem.map((k, i) => {
            return (
              <div key={i}>
                <label className="m-0">{t(k)}</label>
                <input
                  name={k}
                  type="text"
                  defaultValue={service_metadata[k]}
                  onBlur={e => this.handlerOnBlurInputData(e, k)}
                  className={errors[k] ? "mb4 error" : "mb4"}
                />
                {errors[k] && (
                  <Alert color="danger" key={i}>
                    Errore {JSON.stringify(errors[k])}
                  </Alert>
                )}
              </div>
            );
          })}
      </div>
    );
  }
}
export default withNamespaces("service")(ContactInput);
