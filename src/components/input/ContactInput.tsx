import React, { Component, FocusEvent } from "react";

import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { FieldsValidatorType, getValidator } from "../../utils/validators";
import { Option } from 'fp-ts/lib/Option';
import { Alert } from "design-react-kit";
type OwnProps = {
  name: string;
  elem: readonly (keyof ServiceMetadata)[]
  errors: { [key: string]: string },
  service_metadata: {phone?: string, email?: string, pec?: string, support_url?: string},
  onBlur: (type: Option<FieldsValidatorType>) => (event: FocusEvent<HTMLSelectElement | HTMLInputElement>) => void;
};

type Props = WithNamespaces & OwnProps;

class ContactInput extends Component<Props> {
  public state: {
    metadata: {
      pec?: string,
      phone?: string,
      email?: string,
      support_url?: string,
      [index: string]: string | undefined
    },
    error: string
  } = {
    metadata: {},
    error: ''
  }

  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    // Qui devi riportare eventuali metadati ricevuti dal backend
    this.setState({
      metadata: this.props.service_metadata
    })
  }

  private async handler(
    event: FocusEvent<HTMLInputElement>,
    k: keyof ServiceMetadata,
  ) {
    // Validazione del formato del dato
    this.props.onBlur(getValidator(k))(event)

    await this.setState({
      metadata: {
        ...this.state.metadata,
        [k]: event.target.value,
      },
    })

    await this.setState({
      error: Object.keys(this.state.metadata).filter(el => this.state.metadata[el]).reduce(
        (acc, el) => ''
      , 'ricordati di inserire almeno un contatto!')
    })

  }

  render() {
    const { elem, errors, service_metadata, t} = this.props;
    const { error } = this.state;
    return(
      <div>
        {error.length > 0 && <Alert color="warning">Attenzione {JSON.stringify(error)}</Alert>}
        {elem && elem.map((k, i) =>
          {
            return (
              <div key={i}>
                <label className="m-0">{t(k)}</label>
                  <input
                    name={k}
                    type="text"
                    defaultValue={Object(service_metadata)[k]}
                    onBlur={(e) => this.handler(e, k)}
                    className={errors[k] ? "mb4 error" : "mb4"}
                  />
                {errors[k] && <Alert color="danger" key={i}>Errore {JSON.stringify(errors[k])}</Alert>}
          </div>
            )
          })
        }
      </div>
    )
  }
}
export default withNamespaces("service")(ContactInput);