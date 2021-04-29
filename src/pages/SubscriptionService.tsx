import React, { ChangeEvent, Component, FocusEvent } from "react";
import { Option, isSome } from 'fp-ts/lib/Option'
import { WithNamespaces, withNamespaces } from "react-i18next";

import { Button } from "design-react-kit";

import { RouteComponentProps } from "react-router";
import { StorageContext } from "../context/storage";
import { getFromBackend, putToBackend } from "../utils/backend";

import { Alert } from "design-react-kit";
import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import MetadataInput from "../components/input/MetadataInput";

import * as ts from "io-ts";
// Lorenzo: Qui ho i vari tipi che posso usare
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { ServiceId } from "../../generated/definitions/api/ServiceId";
import UploadLogo from "../components/UploadLogo";
import { getConfig } from "../utils/config";
import { getBase64OfImage } from "../utils/image";
import { getValidator, FieldsValidatorType} from "../utils/validators";
import { isContactExists } from "../utils/service";

const LogoParamsApi = ts.interface({
  logo: NonEmptyString,
  serviceId: ServiceId
});

type LogoParamsApi = ts.TypeOf<typeof LogoParamsApi>;

const LogoErrorBodyApi = ts.interface({
  detail: ts.string,
  status: ts.number,
  title: ts.string
});

type LogoErrorBodyApi = ts.TypeOf<typeof LogoErrorBodyApi>;

const LogoSuccessBodyApi = ts.interface({});

type LogoSuccessBodyApi = ts.TypeOf<typeof LogoSuccessBodyApi>;

const SERVICES_LOGO_PATH =
  getConfig("IO_DEVELOPER_PORTAL_LOGO_PATH") + "/services/";

// Lorenzo: a cosa mi serve?
type OwnProps = {};
// Lorenzo: viene aggiunto qui:
type Props = RouteComponentProps<{ service_id: string }> &
  WithNamespaces &
  OwnProps;

/*const Form = ts.type({
  fiscaleCode: FiscalCodeCheck,
})
type Form = ts.TypeOf<typeof Form>;*/
// Lorenzo: possiamo rivedere questo stato? Magari ricreandolo tramite una union dei possibili stati validi evitando stati incosistenti?
type SubscriptionServiceState = {
  form: {
    metadata: {
      [index:string]: unknown
    }
  }; // Form & {[index: string]: string};
  errorLogoUpload: boolean; // Lorenzo: verifico se il logo è stato inviato
  service?: Service; // Lorenzo: dati del servizio, perchè opzionale?
  isValid?: boolean; // Lorenzo: il serivizio è valido?
  logo?: string; // Lorenzo: il servizio ha un logo?
  logoIsValid: boolean; // Lorenzo: verifico che il logo sia una stringa valida
  logoUploaded: boolean; // Lorenzo: verfico che il logo sia stato inviato, ma non è un duplicato di errorLogoUpload???
  originalIsVisible?: boolean; // Lorenzo: il servizio è già visibile?
  errors: {[key: string]: string} // {[key: string]: string | ts.Errors}
};

// Lorenzo: questa funzione prende un input e verifica se è uno dei campi tra "max_allowed_payment_amount", "authorized_cidrs", "authorized_recipients" per effettuare delle operazioni sul value oppure nessuno e ritorno il value ricevuto.
function inputValueMap(name: string, value: string | boolean) {
  switch (name) {
    case "max_allowed_payment_amount":
      return Number(value);

    case "authorized_cidrs":
    case "authorized_recipients": {
      if (typeof value === "string") {
        return value.split(";");
      }
      return [];
    }

    default:
      return value;
  }
}

class SubscriptionService extends Component<Props, SubscriptionServiceState> {
  // Lorenzo: Il mio stato React
  public state: SubscriptionServiceState = {
    form: {
      metadata: {
        scope: 'LOCAL'
      }
    },
    errorLogoUpload: false,
    service: undefined,
    isValid: true,
    logo: undefined, // Lorenzo: parto con un logo undefined e un true a logoIsValid, non è un controsenso?
    logoIsValid: true, // Lorenzo: si da per scontato che il logo sia valido?
    logoUploaded: true, // Lorenzo: si da per scontato che esista un logo?
    originalIsVisible: undefined,
    errors: {}
  };

  public async componentDidMount() {
    const serviceId = this.props.match.params.service_id;

    // Lorenzo: mi prendo il service dal backend
    const serviceFromBackend = await getFromBackend<Service>({
      path: `services/${serviceId}`
    });

    const service = {
      ...serviceFromBackend,
      service_metadata: serviceFromBackend.service_metadata
        ? serviceFromBackend.service_metadata
        : {
            scope: ServiceScopeEnum.LOCAL
          }
    };

    // Lorenzo: imposto lo stato :)
    this.setState({
      service,
      originalIsVisible: serviceFromBackend.is_visible
    });
  }

  public handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    // Lorenzo: qui ricevo un Either Left/Right che non me ne faccio nulla, al posto dell map usiamo una fold?
    Service.decode({
      ...this.state.service,
      [name]: inputValueMap(name, value)
    })
      .map(service => this.setState({ service, isValid: true }))
      .mapLeft(() => this.setState({
        isValid: false
      }));
  };

  public getHandleBlur = (type: Option<FieldsValidatorType>) => (event: FocusEvent<HTMLInputElement>) => {
    const target = event.target;
    const inputValue = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    console.log('On Blur', name, inputValue, Object.keys(this.state.errors).length);

    isSome(type) ? type.value.decode(inputValueMap(name, inputValue)).fold(
      err => {
        console.log('Inserisco errore', name, inputValue)
        return this.setState({
          errors : {
            ...this.state.errors,
            [name]: this.props.t("validation:field_error", { field: this.props.t(name) })
          },
          isValid: false
        })
      },
      () => {
        console.log('Elimino errore', name, inputValue)
        const errors: {[key:string]: string} = Object.keys(this.state.errors).reduce((result: {[key:string]: string}, key) => {
          if(key !== name) {
            result[key] = this.state.errors[key];
          }
          return result;
        }, {});
        return this.setState({
          errors : errors,
          isValid: Object.keys(errors).length > 0 ? false : true,
          form: {
            ...this.state.form,

            [name]: inputValue === "" ? undefined : inputValue

          }
        })
      }
    )
    :
      this.setState( () => {
        const errors: {[key:string]: string} = Object.keys(this.state.errors).reduce((result: {[key:string]: string}, key) => {
          if(key !== name) {
            result[key] = this.state.errors[key];
          }
          return result;
        }, {});
        return{
          errors : errors,
          isValid: Object.keys(errors).length > 0 ? false : true,
          form: {
            ...this.state.form,

            [name]: inputValue === "" ? undefined : inputValue

          }
      }
    })
    console.log(this.state)
  }

  /*
  Se valido un campo opzionale che fa parte di un blocco in cui ho un campo obbligatorio ma non ancora inserito, va in errore il campo opzionale. Forse dovrei avere dei metadati opzionali e metadati obbligatori. Dovrei pensare di fare dei controlli specifici sul singolo piuttosto che fare su tutto il blocco ogni volta. Altrimenti se ho dei campi obbligatori ancora non compilati dall'utente, me li segnalerebbe come errore.
  */
  public getHandleMetadataBlur = (type: Option<FieldsValidatorType>) => (
    event: FocusEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const {
      target: { name, value }
    } = event;
    const inputValue = inputValueMap(name, value);
    console.log('On Blur Metadata', name, value, inputValue, Object.keys(this.state.errors).length);
    (value && value.length>0) && isSome(type) ? type.value.decode(inputValue).fold(
      err => {
        console.log('Inserisco errore', name, inputValue)
        return this.setState({
          errors : {
            ...this.state.errors,
            [name]: this.props.t("validation:field_error", { field: this.props.t(name) })
          },
          isValid: false
        })
      },
      () => {
        console.log('Elimino errore', name, inputValue)
        const errors: {[key:string]: string} = Object.keys(this.state.errors).reduce((result: {[key:string]: string}, key) => {
          if(key !== name) {
            result[key] = this.state.errors[key];
          }
          return result;
        }, {});
        return this.setState({
          errors : errors,
          isValid: Object.keys(errors).length > 0 ? false : true,
          form: {
            ...this.state.form,
            metadata: {
            ...(this.state.form && this.state.form.metadata
              ? this.state.form.metadata
              : undefined),
            [name]: inputValue === "" ? undefined : inputValue
            }
          }
        })
      }
    )
    :
      this.setState( () => {
        const errors: {[key:string]: string} = Object.keys(this.state.errors).reduce((result: {[key:string]: string}, key) => {
          if(key !== name) {
            result[key] = this.state.errors[key];
          }
          return result;
        }, {});
        return{
          errors : errors,
          isValid: Object.keys(errors).length > 0 ? false : true,
          form: {
            ...this.state.form,
            metadata: {
            ...(this.state.form && this.state.form.metadata
              ? this.state.form.metadata
              : undefined),
            [name]: inputValue === "" ? undefined : inputValue
            }
          }
      }
    })
    console.log(this.state)


  }

  public handleMetadataChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const {
      target: { name, value }
    } = event;
    const inputValue = inputValueMap(name, value);
    Service.decode({
      ...this.state.service,
      service_metadata: {
        ...(this.state.service && this.state.service.service_metadata
          ? this.state.service.service_metadata
          : undefined),
        [name]: inputValue === "" ? undefined : inputValue
      }
    })
    .map(service => this.setState({ service }));
  };

  public handleSubmit = async () => {

    const serviceToUpdate = {
      ...this.state.service,
      ...this.state.form,
      service_metadata: {
        ...(this.state.service ? this.state.service.service_metadata : {}),
        ...this.state.form.metadata
      }
    }

    /*
    support_url?: (string & INonEmptyStringTag) | undefined; }' is not assignable to type '{  support_url?: (string & INonEmptyStringTag) | undefined; }'
    support_url?: (string & INonEmptyStringTag) | undefined; }' is not assignable to type '{ scope: ServiceScopeEnum; }'.
    Types of property 'scope' are incompatible.
      Type 'ServiceScopeEnum | undefined' is not assignable to type 'ServiceScopeEnum'.
        Type 'undefined' is not assignable to type 'ServiceScopeEnum'.ts(2322)
    */

    const serviceDecoding = Service.decode(serviceToUpdate);

    /*const notExistContact = (this.state.form && this.state.form.metadata &&
      !this.state.form.metadata['phone'] &&
      !this.state.form.metadata['email'] &&
      !this.state.form.metadata['pec'] &&
      !this.state.form.metadata['support_url']
    )*/
    if (serviceDecoding.isLeft() || (serviceToUpdate.service_metadata && isContactExists(serviceToUpdate.service_metadata as ServiceMetadata))) {
      this.setState({ isValid: false });
      throw new Error("Wrong parameters format");
    }

    const service = serviceDecoding.value;
    // Lorenzo: ho bloccato l'invio al server e fatto una console.log dei dati
    /*await putToBackend({
      path: `services/${service.service_id}`,
      options: {
        // limit fields to editable ones
        body: JSON.stringify({
          organization_fiscal_code: service.organization_fiscal_code,
          organization_name: service.organization_name,
          department_name: service.department_name,
          service_name: service.service_name,
          max_allowed_payment_amount: service.max_allowed_payment_amount,
          authorized_cidrs: service.authorized_cidrs,
          authorized_recipients: service.authorized_recipients,
          is_visible: service.is_visible,
          service_metadata: service.service_metadata
        })
      }
    });*/
    console.log("***SALVATAGGIO DATI***", service);
    console.log('*** STATO ***', this.state);
    console.log({
      organization_fiscal_code: service.organization_fiscal_code,
      organization_name: service.organization_name,
      department_name: service.department_name,
      service_name: service.service_name,
      max_allowed_payment_amount: service.max_allowed_payment_amount,
      authorized_cidrs: service.authorized_cidrs,
      authorized_recipients: service.authorized_recipients,
      is_visible: service.is_visible,
      service_metadata: service.service_metadata
    });
  };

  public handleServiceLogoSubmit = async () => {
    LogoParamsApi.decode({
      logo: this.state.logo,
      serviceId: this.state.service ? this.state.service.service_id : undefined
    }).fold(
      _ =>
        this.setState({
          logo: undefined,
          logoIsValid: false,
          logoUploaded: false
        }),
      async logoParamsApi => {
        const responseOrError = await putToBackend({
          path: `services/${logoParamsApi.serviceId}/logo`,
          options: {
            body: JSON.stringify({ logo: logoParamsApi.logo })
          }
        });

        LogoErrorBodyApi.decode(responseOrError).bimap(
          () =>
            LogoSuccessBodyApi.decode(responseOrError).map(_ => {
              this.setState({
                errorLogoUpload: false,
                logo: undefined,
                logoIsValid: true,
                logoUploaded: true
              });
            }),
          _ =>
            this.setState({
              errorLogoUpload: true,
              logo: undefined,
              logoIsValid: false,
              logoUploaded: false
            })
        );
      }
    );
  };

  public handleServiceLogoChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.target.files &&
    event.target.files.length === 1 &&
    event.target.files[0].type === "image/png"
      ? this.setState({
          logo: await getBase64OfImage(event.target.files[0]),
          logoIsValid: true
        })
      : this.setState({
          logo: undefined,
          logoIsValid: false
        });
  };

  public handleOnErrorImage = () => {
    this.setState({
      logoUploaded: false
    });
  };

  public render() {
    const {
      errorLogoUpload,
      service,
      isValid,
      logo,
      logoIsValid,
      logoUploaded,
      originalIsVisible
    } = this.state;
    const { t } = this.props;

    return service ? (
      <StorageContext.Consumer>
        {storage => (
          <div>
            {!isValid && <Alert color="danger">Campi non validi</Alert>}

            <h4>
              {t("title")} {service.service_id}
            </h4>
            <form className="mb-5 mt-1">
              <div className="shadow p-4">
                <label className="m-0">{t("name")}*</label>
                <input
                  name="service_name"
                  type="text"
                  defaultValue={service.service_name}
                  onBlur={this.getHandleBlur(getValidator('service_name'))}
                  className="mb-4"
                />
                {this.state.errors['service_name'] && <Alert color="danger">Errore {JSON.stringify(this.state.errors['service_name'])}</Alert>}

                <label className="m-0">{t("department")}*</label>
                <input
                  name="department_name"
                  type="text"
                  defaultValue={service.department_name}
                  onBlur={this.getHandleBlur(getValidator('department_name'))}
                  className="mb-4"
                />
                {this.state.errors['department_name'] && <Alert color="danger">Errore {JSON.stringify(this.state.errors['department_name'])}</Alert>}

                <label className="m-0">{t("organization")}*</label>
                <input
                  name="organization_name"
                  type="text"
                  defaultValue={service.organization_name}
                  onBlur={this.getHandleBlur(getValidator('organization_name'))}
                  className="mb-4"
                />
                {this.state.errors['organization_name'] && <Alert color="danger">Errore {JSON.stringify(this.state.errors['organization_name'])}</Alert>}

                <label className="m-0">{t("organization_fiscal_code")}*</label>
                <input
                  name="organization_fiscal_code"
                  type="text"
                  defaultValue={service.organization_fiscal_code}
                  onBlur={this.getHandleBlur(getValidator('organization_fiscal_code'))}
                  className="mb-4"
                />
                {this.state.errors['organization_fiscal_code'] && <Alert color="danger">Errore {JSON.stringify(this.state.errors['organization_fiscal_code'])}</Alert>}

                {storage.isApiAdmin && (
                  <div>
                    <label className="m-0">
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
                      onBlur={this.getHandleBlur(getValidator('max_allowed_payment_amount'))}
                      className="mb-4"
                    />
                  </div>
                )}

                <div>
                  <label className="m-0">{t("authorized_ips")}</label>
                  <input
                    name="authorized_cidrs"
                    type="text"
                    defaultValue={service.authorized_cidrs.join(";")}
                    onChange={this.handleInputChange}
                    onBlur={this.getHandleBlur(getValidator('authorized_cidrs'))}
                    className="mb-4"
                  />
                  {this.state.errors['authorized_cidrs'] && <Alert color="danger">Errore {JSON.stringify(this.state.errors['authorized_cidrs'])}</Alert>}
                </div>

                {storage.isApiAdmin && (
                  <div>
                    <label className="m-0">{t("authorized_recipients")}*</label>
                    <input
                      name="authorized_recipients"
                      type="text"
                      defaultValue={service.authorized_recipients.join(";")}
                      onChange={this.handleInputChange}
                      className="mb-4"
                    />
                  </div>
                )}

                {storage.isApiAdmin && (
                  <div>
                    <input
                      name="is_visible"
                      type="checkbox"
                      defaultChecked={service.is_visible}
                      onChange={this.handleInputChange}
                      className="mb-4 mr-2"
                    />
                    <label className="m-0">{t("visible_service")}</label>
                  </div>
                )}
              </div>

              <div className="shadow p-4">
                <h5>{t("service_logo")}</h5>
                <UploadLogo
                  errorLogoUpload={errorLogoUpload}
                  isSubmitEnabled={logo !== undefined && logoIsValid}
                  isValid={logoIsValid}
                  logoPath={`${SERVICES_LOGO_PATH}${service.service_id.toLowerCase()}.png`}
                  logoUploaded={logoUploaded}
                  nameButton="service_logo_upload"
                  nameInput="service_logo"
                  onChangeHandler={this.handleServiceLogoChange}
                  onError={this.handleOnErrorImage}
                  onSubmitHandler={this.handleServiceLogoSubmit}
                />
              </div>

              <div className="shadow p-4">
                <h5>Metadata</h5>
                <MetadataInput
                  onChange={this.handleMetadataChange}
                  onBlur={this.getHandleMetadataBlur}
                  service_metadata={service.service_metadata}
                  isApiAdmin={storage.isApiAdmin}
                  originalServiceIsVisible={originalIsVisible || false}
                  errors={this.state.errors}
                />
              </div>

              <Button
                color="primary"
                disabled={!isValid}
                onClick={this.handleSubmit}
              >
                {t("save")}
              </Button>
            </form>

            {service.authorized_recipients.length > 0 && (
              <div className="mb-3">
                {t("authorized_recipients")}:{" "}
                {service.authorized_recipients.join(";")}
              </div>
            )}

            {service.authorized_cidrs.length > 0 && (
              <div className="mb-3">
                {t("authorized_ips")}: {service.authorized_cidrs}
              </div>
            )}

            {!storage.isApiAdmin && (
              <div className="mb-3">
                {t("max_allowed_payment_amount")}:{" "}
                {service.max_allowed_payment_amount} {t("eurocents")}
              </div>
            )}
          </div>
        )}
      </StorageContext.Consumer>
    ) : null;
  }
}

export default withNamespaces("service")(SubscriptionService);
