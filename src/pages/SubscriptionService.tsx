import { Button } from "design-react-kit";
import { Alert } from "design-react-kit";
import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";
import * as ts from "io-ts";

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import React, { ChangeEvent, Component, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { ServiceId } from "../../generated/definitions/api/ServiceId";
import MetadataInput from "../components/input/MetadataInput";
import UploadLogo from "../components/UploadLogo";
import { StorageContext } from "../context/storage";
import { getFromBackend, putToBackend } from "../utils/backend";
import { getConfig } from "../utils/config";
import { getBase64OfImage } from "../utils/image";
import { isContactExists, isMandatoryFieldsValid } from "../utils/service";
import { checkValue } from "../utils/validators";

const LogoParamsApi = ts.interface({
  logo: NonEmptyString,
  serviceId: ServiceId
});

type LogoParamsApi = ts.TypeOf<typeof LogoParamsApi>;
type InputValue = string | boolean | number | readonly string[];

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

type OwnProps = {};

type Props = RouteComponentProps<{ service_id: string }> &
  WithNamespaces &
  OwnProps;

type SubscriptionServiceState = {
  form: {
    metadata: {
      [index: string]: unknown;
    };
  };
  errorLogoUpload: boolean;
  service?: Service;
  isValid?: boolean;
  logo?: string;
  logoIsValid: boolean;
  logoUploaded: boolean;
  originalIsVisible?: boolean;
  errors: { [key: string]: string };
};

function inputValueMap(name: string, value: InputValue) {
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
  public state: SubscriptionServiceState = {
    form: {
      metadata: {
        scope: "LOCAL"
      }
    },
    errorLogoUpload: false,
    service: undefined,
    isValid: true,
    logo: undefined,
    logoIsValid: true,
    logoUploaded: true,
    originalIsVisible: undefined,
    errors: {}
  };

  public async componentDidMount() {
    const serviceId = this.props.match.params.service_id;

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

    this.setState({
      service,
      originalIsVisible: serviceFromBackend.is_visible
    });
  }

  private handleError = (name: string) => {
    this.setState({
      errors: {
        ...this.state.errors,
        [name]: this.props.t("validation:field_error", {
          field: this.props.t(name)
        })
      },
      isValid: false
    });
  };

  private setData = (
    errors: { [key: string]: string },
    name: string,
    inputValue: InputValue
  ) => {
    return this.setState({
      errors,
      isValid: Object.keys(errors).length > 0 === true,
      form: {
        ...this.state.form,
        [name]: inputValue === "" ? undefined : inputValueMap(name, inputValue)
      }
    });
  };

  private setMetadata = (
    errors: { [key: string]: string },
    name: string,
    inputValue: InputValue
  ) => {
    this.setState({
      errors,
      isValid: Object.keys(errors).length > 0 === true,
      form: {
        ...this.state.form,
        metadata: {
          ...(this.state.form && this.state.form.metadata
            ? this.state.form.metadata
            : undefined),
          [name]: inputValue === "" ? undefined : inputValue
        }
      }
    });
  };

  private removeError = (name: string) => {
    const key = name;
    const { [key]: fieldToRemove, ...others } = this.state.errors;
    return others;
  };

  public handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    Service.decode({
      ...this.state.service,
      [name]: inputValueMap(name, value)
    })
      .map(service => this.setState({ service, isValid: true }))
      .mapLeft(() =>
        this.setState({
          isValid: false
        })
      );
  };

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
    }).map(service => this.setState({ service }));
  };

  public getHandleBlur = (prop: keyof ServiceMetadata | keyof Service) => (
    event: FocusEvent<HTMLInputElement>
  ) => {
    const target = event.target;
    const inputValue =
      target.type === "checkbox" ? target.checked : target.value;
    console.log("Input", prop, inputValue);
    const value = inputValueMap(prop, inputValue);
    console.log("Value", inputValue);
    checkValue(prop, inputValue).fold(
      () => this.handleError(prop),
      () => this.setData(this.removeError(prop), prop, value)
    );
  };

  public getHandleMetadataBlur = (
    prop: keyof ServiceMetadata | keyof Service
  ) => (event: FocusEvent<HTMLSelectElement | HTMLInputElement>) => {
    const {
      target: { name, value }
    } = event;
    const inputValue = inputValueMap(name, value);

    value && value.length > 0
      ? checkValue(prop, inputValue).fold(
          () => this.handleError(name),
          () => this.setMetadata(this.removeError(name), name, inputValue)
        )
      : this.setMetadata(this.removeError(name), name, inputValue);
  };

  public handleSubmit = async () => {
    const serviceToUpdate = {
      ...this.state.service,
      ...this.state.form,
      service_metadata: {
        ...(this.state.service ? this.state.service.service_metadata : {}),
        ...this.state.form.metadata
      }
    };

    const serviceDecoding = Service.decode(serviceToUpdate);

    if (
      serviceDecoding.isLeft() ||
      (serviceToUpdate.service_metadata &&
        !isContactExists(serviceToUpdate.service_metadata as ServiceMetadata) &&
        !isMandatoryFieldsValid(serviceToUpdate.service_metadata as Service))
    ) {
      this.setState({ isValid: false });
      throw new Error("Wrong parameters format");
    }

    const service = serviceDecoding.value;

    await putToBackend({
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
                  onBlur={this.getHandleBlur("service_name")}
                  className="mb-4"
                />
                {this.state.errors[`service_name`] && (
                  <Alert color="danger">
                    Errore {JSON.stringify(this.state.errors[`service_name`])}
                  </Alert>
                )}

                <label className="m-0">{t(`department`)}*</label>
                <input
                  name="department_name"
                  type="text"
                  defaultValue={service.department_name}
                  onBlur={this.getHandleBlur("department_name")}
                  className="mb-4"
                />
                {this.state.errors[`department_name`] && (
                  <Alert color="danger">
                    Errore{" "}
                    {JSON.stringify(this.state.errors[`department_name`])}
                  </Alert>
                )}

                <label className="m-0">{t("organization")}*</label>
                <input
                  name="organization_name"
                  type="text"
                  defaultValue={service.organization_name}
                  onBlur={this.getHandleBlur("organization_name")}
                  className="mb-4"
                />
                {this.state.errors[`organization_name`] && (
                  <Alert color="danger">
                    Errore{" "}
                    {JSON.stringify(this.state.errors[`organization_name`])}
                  </Alert>
                )}

                <label className="m-0">{t("organization_fiscal_code")}*</label>
                <input
                  name="organization_fiscal_code"
                  type="text"
                  defaultValue={service.organization_fiscal_code}
                  onBlur={this.getHandleBlur("organization_fiscal_code")}
                  className="mb-4"
                />
                {this.state.errors[`organization_fiscal_code`] && (
                  <Alert color="danger">
                    Errore{" "}
                    {JSON.stringify(
                      this.state.errors[`organization_fiscal_code`]
                    )}
                  </Alert>
                )}

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
                      onBlur={this.getHandleBlur("max_allowed_payment_amount")}
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
                    onBlur={this.getHandleBlur("authorized_cidrs")}
                    className="mb-4"
                  />
                  {this.state.errors[`authorized_cidrs`] && (
                    <Alert color="danger">
                      Errore{" "}
                      {JSON.stringify(this.state.errors[`authorized_cidrs`])}
                    </Alert>
                  )}
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
