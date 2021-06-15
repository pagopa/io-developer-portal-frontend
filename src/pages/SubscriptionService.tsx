import { Alert, Button } from "design-react-kit";

import { Service } from "io-functions-commons/dist/generated/definitions/Service";
import { ServiceMetadata } from "io-functions-commons/dist/generated/definitions/ServiceMetadata";
import { ServiceScopeEnum } from "io-functions-commons/dist/generated/definitions/ServiceScope";
import * as ts from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import React, { ChangeEvent, Component, FocusEvent } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { CIDR } from "../../generated/definitions/api/CIDR";
import { ServiceId } from "../../generated/definitions/api/ServiceId";
import MetadataInput from "../components/input/MetadataInput";
import UploadLogo from "../components/UploadLogo";
import { StorageContext } from "../context/storage";
import { getFromBackend, putToBackend } from "../utils/backend";
import { getConfig } from "../utils/config";
import { getBase64OfImage } from "../utils/image";
import { ValidDraftService, ValidService } from "../utils/service";
import { checkValue, InputValue } from "../utils/validators";

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

type OwnProps = {};

type Props = RouteComponentProps<{ service_id: string }> &
  WithNamespaces &
  OwnProps;

enum ServiceFormState {
  "SAVED_OK" = "SAVED_OK", // Succesfull saved to backend
  "SAVED_ERROR" = "SAVED_ERROR", // Unsuccesfull saved to backend
  "NOT_SAVE" = "NOT_SAVE" // Not yet saved to backend
}

type SubscriptionServiceState = {
  errorLogoUpload: boolean;
  service?: Service;
  isValid?: boolean;
  formState: ServiceFormState;
  logo?: string;
  logoIsValid: boolean;
  logoUploaded: boolean;
  originalIsVisible?: boolean;
  errors: Record<string, string>;
  timestampLogo: number;
};

function withDefaultSubnet(value: string): CIDR {
  return value.lastIndexOf("/") === -1
    ? (`${value}/32` as CIDR)
    : (value as CIDR);
}

function inputValueMap(name: string, value: InputValue) {
  switch (name) {
    case "max_allowed_payment_amount":
      return Number(value);
    case "authorized_cidrs": {
      if (typeof value === "string") {
        return value
          .replace(/\s/g, "") // Remove all whitespaces
          .replace(/\;$/, "") // Remove last semicolon to avoid empty string on last
          .split(";");
      }
      return [];
    }
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
    errorLogoUpload: false,
    service: undefined,
    isValid: true,
    formState: ServiceFormState.NOT_SAVE,
    logo: undefined,
    logoIsValid: true,
    logoUploaded: true,
    originalIsVisible: undefined,
    errors: {},
    timestampLogo: Date.now()
  };

  public async componentDidMount() {
    const serviceId = this.props.match.params.service_id;

    const serviceFromBackend = await getFromBackend<Service>({
      path: `services/${serviceId}`
    });

    const service = {
      ...serviceFromBackend,
      authorized_cidrs: serviceFromBackend.authorized_cidrs.map(
        withDefaultSubnet
      ),
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
    errors: Record<string, string>,
    name: string,
    inputValue: InputValue
  ) => {
    Service.decode({
      ...this.state.service,
      [name]: inputValue === "" ? undefined : inputValue
    }).fold(
      () => this.setState({ isValid: false }),
      service =>
        this.setState(() => ({
          errors,
          isValid: Object.keys(errors).length === 0,
          service,
          formState: ServiceFormState.NOT_SAVE
        }))
    );
  };

  private setMetadata = (
    errors: Record<string, string>,
    name: string,
    inputValue: InputValue
  ) => {
    Service.decode({
      ...this.state.service,
      service_metadata: {
        ...(this.state.service && this.state.service.service_metadata
          ? this.state.service.service_metadata
          : undefined),
        [name]: inputValue === "" ? undefined : inputValue
      }
    }).fold(
      () => this.setState({ isValid: false }),
      service =>
        this.setState(() => ({
          errors,
          isValid: Object.keys(errors).length === 0,
          service,
          formState: ServiceFormState.NOT_SAVE
        }))
    );
  };

  private removeError = (keyName: string) => {
    const { [keyName]: fieldToRemove, ...others } = this.state.errors;
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
      .map(service =>
        this.setState({
          service,
          formState: ServiceFormState.NOT_SAVE,
          isValid: true
        })
      )
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
    }).map(service =>
      this.setState({
        service,
        formState: ServiceFormState.NOT_SAVE
      })
    );
  };

  public getHandleBlur = (prop: keyof ServiceMetadata | keyof Service) => (
    event: FocusEvent<HTMLInputElement>
  ) => {
    const target = event.target;
    const inputValue =
      target.type === "checkbox" ? target.checked : target.value;
    const value = inputValueMap(prop, inputValue);

    checkValue(prop, value).fold(
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

    checkValue(prop, inputValue).fold(
      () => this.handleError(prop),
      () => this.setMetadata(this.removeError(name), name, inputValue)
    );
  };

  private validateServiceData = (
    validator: ts.Decoder<
      ValidService | ValidDraftService,
      ValidService | ValidDraftService
    >,
    data: unknown
  ) => {
    const decoded = validator.decode(data as (
      | ValidService
      | ValidDraftService));
    if (decoded.isLeft()) {
      this.setState({ isValid: false });
      throw new Error("Wrong parameters format");
    }

    return decoded.value;
  };

  public handleSubmit = async () => {
    const serviceToUpdate = {
      ...this.state.service,
      service_metadata: {
        ...(this.state.service && this.state.service.service_metadata),
        scope:
          this.state.service && this.state.service.service_metadata
            ? this.state.service.service_metadata.scope
            : "LOCAL"
      }
    };

    const service = this.validateServiceData(ValidService, serviceToUpdate);

    if (Service.is(await this.updateService(service))) {
      this.setState({ formState: ServiceFormState.SAVED_OK });
    } else {
      this.setState({ formState: ServiceFormState.SAVED_ERROR });
    }
  };

  public handleSubmitDraft = async () => {
    const serviceToUpdate = {
      ...this.state.service,
      service_metadata: {
        ...(this.state.service && this.state.service.service_metadata),
        scope:
          this.state.service && this.state.service.service_metadata
            ? this.state.service.service_metadata.scope
            : "LOCAL"
      }
    };

    const service = this.validateServiceData(
      ValidDraftService,
      serviceToUpdate
    );

    if (Service.is(await this.updateService(service))) {
      this.setState({ formState: ServiceFormState.SAVED_OK });
    } else {
      this.setState({ formState: ServiceFormState.SAVED_ERROR });
    }
  };

  private updateService = async (service: ValidService | ValidDraftService) => {
    return await putToBackend<{
      statusCode: number;
    }>({
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
                logoUploaded: true,
                timestampLogo: Date.now()
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

  // tslint:disable-next-line: cognitive-complexity no-big-function
  public render() {
    const {
      errorLogoUpload,
      service,
      isValid,
      formState,
      logo,
      logoIsValid,
      logoUploaded,
      timestampLogo
    } = this.state;
    const { t } = this.props;

    return service ? (
      <StorageContext.Consumer>
        {// tslint:disable-next-line: no-big-function
        storage => (
          <div>
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
                    {this.state.errors[`service_name`]}
                  </Alert>
                )}

                <label className="m-0">{t("department")}*</label>
                <input
                  name="department_name"
                  type="text"
                  defaultValue={service.department_name}
                  onBlur={this.getHandleBlur("department_name")}
                  className="mb-4"
                />
                {this.state.errors[`department_name`] && (
                  <Alert color="danger">
                    {this.state.errors[`department_name`]}
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
                    {this.state.errors[`organization_name`]}
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
                    {this.state.errors[`organization_fiscal_code`]}
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
                    {this.state.errors[`max_allowed_payment_amount`] && (
                      <Alert color="danger">
                        {this.state.errors[`max_allowed_payment_amount`]}
                      </Alert>
                    )}
                  </div>
                )}

                <div>
                  <label className="m-0">{t("authorized_ips")}</label>
                  <p>
                    <small>{t("example_authorized_ips")}</small>
                  </p>
                  <input
                    name="authorized_cidrs"
                    type="text"
                    defaultValue={service.authorized_cidrs.join(";")}
                    onBlur={this.getHandleBlur("authorized_cidrs")}
                    className="mb-4"
                  />
                  {this.state.errors[`authorized_cidrs`] && (
                    <Alert color="danger">
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
                      onBlur={this.getHandleBlur("authorized_recipients")}
                      className="mb-4"
                    />
                    {this.state.errors[`authorized_recipients`] && (
                      <Alert color="danger">
                        {JSON.stringify(
                          this.state.errors[`authorized_recipients`]
                        )}
                      </Alert>
                    )}
                  </div>
                )}

                <div>
                  <label className="m-0">{t("scope")}*</label>
                  <select
                    name="scope"
                    value={
                      service.service_metadata
                        ? service.service_metadata.scope
                        : undefined
                    }
                    className="form-control mb-4"
                    disabled={service.is_visible && !storage.isApiAdmin}
                    onChange={this.handleMetadataChange}
                  >
                    <option
                      key={ServiceScopeEnum.NATIONAL}
                      value={ServiceScopeEnum.NATIONAL}
                    >
                      {t(ServiceScopeEnum.NATIONAL.toLocaleLowerCase())}
                    </option>
                    <option
                      key={ServiceScopeEnum.LOCAL}
                      value={ServiceScopeEnum.LOCAL}
                    >
                      {t(ServiceScopeEnum.LOCAL.toLocaleLowerCase())}
                    </option>
                  </select>
                </div>

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

              <div className="shadow p-4 mt-4 mb-4">
                <h5>{t("scheda_servizio")}</h5>
                <MetadataInput
                  onChange={this.handleMetadataChange}
                  onBlur={this.getHandleMetadataBlur}
                  service_metadata={service.service_metadata}
                  isApiAdmin={storage.isApiAdmin}
                  errors={this.state.errors}
                />
              </div>

              <div className="shadow p-4 mt-4 mb-4">
                <h6>{t("service_logo")}</h6>
                <UploadLogo
                  errorLogoUpload={errorLogoUpload}
                  isSubmitEnabled={logo !== undefined && logoIsValid}
                  isValid={logoIsValid}
                  logoPath={`${SERVICES_LOGO_PATH}${service.service_id.toLowerCase()}.png?${timestampLogo}`}
                  logoUploaded={logoUploaded}
                  nameButton="service_logo_upload"
                  nameInput="service_logo"
                  onChangeHandler={this.handleServiceLogoChange}
                  onError={this.handleOnErrorImage}
                  onSubmitHandler={this.handleServiceLogoSubmit}
                />
              </div>
              <div className="shadow p-4 mt-4 mb-4">
                <div className="row">
                  <div className="col-md-6">
                    <Button
                      color="primary"
                      disabled={!isValid}
                      onClick={this.handleSubmit}
                    >
                      {t("save")}
                    </Button>
                  </div>
                  <div className="col-md-6">
                    {storage.isApiAdmin && (
                      <Button color="warning" onClick={this.handleSubmitDraft}>
                        {t("save_draft")}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 row">
                  <div className="col-md-12">
                    {!isValid && <Alert color="danger">Campi non validi</Alert>}
                    {formState === ServiceFormState.SAVED_OK && (
                      <Alert color="success">{t("service_saved_ok")}</Alert>
                    )}
                    {formState === ServiceFormState.SAVED_ERROR && (
                      <Alert color="danger">{t("service_saved_error")}</Alert>
                    )}
                  </div>
                </div>
              </div>
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
