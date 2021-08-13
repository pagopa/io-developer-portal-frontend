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
import AdminFields from "../components/input/AdminFields";
import ContactInput from "../components/input/ContactInput";
import LinkFields from "../components/input/LinkFields";
import MarkdownEditor from "../components/input/MarkdownEditor";
import SecurityFields from "../components/input/SecurityFields";
import JiraComments from "../components/jira/JiraComments";
import JiraStatus from "../components/jira/JiraStatus";
import DisableService from "../components/modal/DisableService";
import PublishService from "../components/modal/PublishService";

import Toastr, {
  ToastrItem,
  ToastrType
} from "../components/notifications/Toastr";
import UploadLogo from "../components/UploadLogo";
import { StorageContext } from "../context/storage";
import { getFromBackend, postToBackend, putToBackend } from "../utils/backend";
import { getConfig } from "../utils/config";
import { LIMITS } from "../utils/constants";
import { getBase64OfImage } from "../utils/image";
import {
  handleDisableReview,
  ReviewStatus,
  ServiceStatus,
  ValidDraftService,
  ValidService
} from "../utils/service";
import { checkValue, InputValue } from "../utils/validators";

const { MARKDOWN } = LIMITS;
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

type SubscriptionServiceState = {
  errorLogoUpload: boolean;
  service?: Service;
  logo?: string;
  logoIsValid: boolean;
  logoUploaded: boolean;
  originalIsVisible?: boolean;
  showError: boolean;
  errors: Record<string, string>;
  timestampLogo: number;
  review: ReviewStatus | null;
  status: string;
  publishService: boolean;
  disableService: boolean;
  toastMessage?: ToastrItem;
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
    logo: undefined,
    logoIsValid: true,
    logoUploaded: true,
    originalIsVisible: undefined,
    showError: false,
    errors: {},
    timestampLogo: Date.now(),
    status: "",
    publishService: false,
    disableService: false,
    review: null,
    toastMessage: undefined
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

    // After service load check if there is a review or a reject in progress
    // this.getServiceReviewStatus(service);

    this.setState({
      service,
      originalIsVisible: serviceFromBackend.is_visible
    });
  }

  private handleError = (name: string, showErrorMessage: boolean = false) => {
    this.setState(() => {
      return {
        errors: {
          ...this.state.errors,
          [name]: this.props.t("validation:field_error", {
            field: this.props.t(name)
          })
        },
        toastMessage: showErrorMessage
          ? {
              id: Math.random(),
              title: this.props.t("toasterMessage:errors_form"),
              description: this.props.t("toasterMessage:errors_description"),
              type: ToastrType.error
            }
          : undefined
      };
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
      () => void 0,
      service =>
        this.setState(() => ({
          errors,
          service
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
      () => void 0,
      service =>
        this.setState(() => ({
          errors,
          service
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
    }).map(service =>
      this.setState({
        service
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
        service
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
    this.setState({
      showError: false
    });
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
    this.setState({
      showError: false
    });
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
      this.setState({
        showError: true,
        toastMessage: {
          id: Math.random(),
          title: this.props.t("toasterMessage:errors_form"),
          description: this.props.t("toasterMessage:errors_description"),
          type: ToastrType.error
        }
      });
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

    try {
      const service = this.validateServiceData(ValidService, serviceToUpdate);

      if (service && !Object.keys(this.state.errors).length) {
        // Save service to backend
        if (Service.is(await this.updateService(service))) {
          this.setState({
            toastMessage: {
              id: Math.random(),
              title: this.props.t("toasterMessage:save_form"),
              description: this.props.t("toasterMessage:save_service"),
              type: ToastrType.success
            }
          });
        } else {
          this.setState({
            toastMessage: {
              id: Math.random(),
              title: this.props.t("toasterMessage:save_form"),
              description: this.props.t("toasterMessage:save_service_error"),
              type: ToastrType.error
            }
          });
        }
        const serviceId = this.props.match.params.service_id;
        // Open a service review ticket
        const toastMessage = await this.handleReviewSubmit(serviceId)
          .then(res => {
            switch (res.status) {
              case 200:
                this.setState({
                  status: ServiceStatus.REVIEW
                });
                return {
                  id: Math.random(),
                  title: this.props.t("toasterMessage:jira_title"),
                  description: this.props.t("toasterMessage:jira_ticket_moved"),
                  type: ToastrType.info
                };
              case 201:
                this.setState({
                  status: ServiceStatus.REVIEW
                });
                return {
                  id: Math.random(),
                  title: this.props.t("toasterMessage:jira_title"),
                  description: this.props.t("toasterMessage:jira_success"),
                  type: ToastrType.success
                };
              case 409:
                return {
                  id: Math.random(),
                  title: this.props.t("toasterMessage:jira_title"),
                  description: this.props.t(
                    "toasterMessage:jira_ticket_already_openend"
                  ),
                  type: ToastrType.warning
                };
            }
          })
          // tslint:disable-next-line: no-identical-functions
          .catch(() => {
            return {
              id: Math.random(),
              title: this.props.t("toasterMessage:jira_title"),
              description: this.props.t("toasterMessage:jira_error"),
              type: ToastrType.error
            };
          });
        this.setState({
          toastMessage
        });
      }
    } catch (e) {
      this.setState({
        showError: true,
        toastMessage: {
          id: Math.random(),
          title: this.props.t("toasterMessage:errors_form"),
          description: this.props.t("toasterMessage:errors_description"),
          type: ToastrType.error
        }
      });
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

    if (service && !Object.keys(this.state.errors).length) {
      if (Service.is(await this.updateService(service))) {
        this.setState({
          showError: false,
          toastMessage: {
            id: Math.random(),
            title: this.props.t("toasterMessage:save_form"),
            description: this.props.t("toasterMessage:save_service"),
            type: ToastrType.success
          }
        });
      } else {
        this.setState({
          showError: true,
          toastMessage: {
            id: Math.random(),
            title: this.props.t("toasterMessage:save_form"),
            description: this.props.t("toasterMessage:save_service_error"),
            type: ToastrType.error
          }
        });
      }
    } else {
      this.setState({
        showError: true,
        toastMessage: {
          id: Math.random(),
          title: this.props.t("toasterMessage:save_form"),
          description: this.props.t("toasterMessage:save_service_error"),
          type: ToastrType.error
        }
      });
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

  private handleReviewSubmit = async (serviceId: string) => {
    return await postToBackend<ReviewStatus>({
      options: {
        body: JSON.stringify({})
      },
      path: `services/${serviceId}/review`
    }).then((res: ReviewStatus) => {
      return res;
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

  public handleDisableService = async () => {
    if (this.state.service) {
      return await handleDisableReview(this.state.service.service_id).then(
        res => {
          if (res.status === 200) {
            this.setState({
              status: ServiceStatus.DEACTIVE
            });
          }
        }
      );
    }
  };

  public handleOnErrorImage = () => {
    this.setState({
      logoUploaded: false
    });
  };

  public renderDisableServiceModal() {
    if (this.state.service) {
      return (
        <DisableService
          show={this.state.disableService}
          serviceId={this.state.service.service_id}
          serviceName={this.state.service.service_name}
          organizationName={this.state.service.organization_name}
          onClose={() => this.setState({ disableService: false })}
          onDisable={this.handleDisableService}
        />
      );
    } else {
      return null;
    }
  }

  private renderPublishServiceModal() {
    if (this.state.service) {
      return (
        <PublishService
          show={this.state.publishService}
          serviceId={this.state.service.service_id}
          serviceName={this.state.service.service_name}
          organizationName={this.state.service.organization_name}
          onClose={() => this.setState({ publishService: false })}
          onPublish={this.handleSubmit}
        />
      );
    } else {
      return null;
    }
  }

  private validateBeforePublish() {
    try {
      const service = this.validateServiceData(
        ValidService,
        this.state.service
      );

      // Check if there is any errors and service is valid
      if (Object.keys(this.state.errors).length === 0 && service) {
        // Open confirm Modal to publish a service review
        return this.setState({ publishService: true });
      }

      this.setState({
        showError: true,
        toastMessage: {
          id: Math.random(),
          title: this.props.t("toasterMessage:errors_form"),
          description: this.props.t("toasterMessage:errors_description"),
          type: ToastrType.error
        }
      });
    } catch (err) {
      this.setState({
        showError: true,
        toastMessage: {
          id: Math.random(),
          title: this.props.t("toasterMessage:errors_form"),
          description: this.props.t("toasterMessage:errors_description"),
          type: ToastrType.error
        }
      });
    }
    // Check field validation after loading service
  }

  private handleToastrClose() {
    this.setState({
      toastMessage: undefined
    });
  }

  private getToaster(message: ToastrItem) {
    return (
      <Toastr
        delay={5000}
        toastMessage={message}
        onToastrClose={_ => this.handleToastrClose()}
        onErrorDetail={() => window.scrollTo(0, 0)}
      />
    );
  }

  // tslint:disable-next-line: no-big-function cognitive-complexity
  public render() {
    const {
      errorLogoUpload,
      service,
      errors,
      showError,
      logo,
      logoIsValid,
      logoUploaded,
      timestampLogo,
      status,
      toastMessage,
      review,
      publishService,
      disableService
    } = this.state;
    const { t } = this.props;
    return service ? (
      <StorageContext.Consumer>
        {// tslint:disable-next-line: no-big-function
        storage => (
          <React.Fragment>
            {toastMessage && this.getToaster(toastMessage)}

            <div className="mt-4 mr-4 ml-4 pt-5 pr-5 pl-5">
              <h4>
                {t("title")} {service.service_id}
              </h4>
              <div className="row">
                <JiraStatus
                  onLoaded={statusService =>
                    this.setState({
                      review: statusService.review,
                      status: statusService.status
                    })
                  }
                  service={service}
                />
              </div>

              <form className="my-4">
                {showError && (
                  <div>
                    <Alert color="danger">
                      <span className="dark-text">
                        {t("publish_error_title")}
                      </span>
                      <span>&nbsp; {t("publish_error_message")}</span>
                    </Alert>
                    <div className="comments-box p-5 mt-4 mb-4">
                      <p>{t("publish_error_detail")}:</p>
                      <ul>
                        {Object.keys(this.state.errors).map((keyName, i) => (
                          <li key={i}>
                            <span className="dark-text">{errors[keyName]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                <div className="card-service p-4">
                  <h5 className="my-4">{t("description_service")}</h5>
                  <label
                    className={
                      errors[`service_name`] ? "mb0 error-text" : "mb0"
                    }
                  >
                    {t("name")}*
                  </label>
                  <input
                    name="service_name"
                    type="text"
                    defaultValue={service.service_name}
                    onBlur={this.getHandleBlur("service_name")}
                    className={errors[`service_name`] ? "mb4 error" : "mb4"}
                  />
                  <label
                    className={
                      errors[`organization_name`] ? "mb0 error-text" : "mb0"
                    }
                  >
                    {t("organization")}*
                  </label>
                  <input
                    name="organization_name"
                    type="text"
                    defaultValue={service.organization_name}
                    onBlur={this.getHandleBlur("organization_name")}
                    className={
                      errors[`organization_name`] ? "mb4 error" : "mb4"
                    }
                  />
                  <label
                    className={
                      errors[`department_name`] ? "mb0 error-text" : "mb0"
                    }
                  >
                    {t("department")}*
                  </label>
                  <input
                    name="department_name"
                    type="text"
                    defaultValue={service.department_name}
                    onBlur={this.getHandleBlur("department_name")}
                    className={errors[`department_name`] ? "mb4 error" : "mb4"}
                  />
                  <label
                    className={
                      errors[`organization_fiscal_code`]
                        ? "mb0 error-text"
                        : "mb0"
                    }
                  >
                    {t("organization_fiscal_code")}*
                  </label>
                  <input
                    name="organization_fiscal_code"
                    type="text"
                    defaultValue={service.organization_fiscal_code}
                    onBlur={this.getHandleBlur("organization_fiscal_code")}
                    className={
                      errors[`organization_fiscal_code`] ? "mb4 error" : "mb4"
                    }
                  />
                  <label className="m-0">{t("address")}</label>
                  <input
                    name={"address"}
                    type="text"
                    defaultValue={
                      service.service_metadata
                        ? service.service_metadata.address
                        : ""
                    }
                    onBlur={this.getHandleMetadataBlur("address")}
                    className="mb-4"
                  />

                  <MarkdownEditor
                    markdown={
                      service.service_metadata &&
                      service.service_metadata.description
                        ? service.service_metadata.description
                        : ""
                    }
                    name="description"
                    markdownLength={[MARKDOWN.MIN, MARKDOWN.MAX]}
                    isMarkdownValid={true}
                    onChangeMarkdown={this.handleMetadataChange}
                    onBlurMarkdown={this.getHandleMetadataBlur("description")}
                  />
                  {errors[`description`] && (
                    <Alert color="danger">{errors[`description`]}</Alert>
                  )}
                </div>
              </form>

              <form>
                <div className="card-service p-4 my-4">
                  <h5 className="my-4">{t("useful_links")}</h5>
                  <LinkFields
                    onChange={this.handleMetadataChange}
                    onBlur={this.getHandleMetadataBlur}
                    service_metadata={service.service_metadata}
                    isApiAdmin={storage.isApiAdmin}
                    showError={showError}
                    errors={errors}
                  />
                </div>
              </form>

              <form>
                <div className="card-service p-4 my-4">
                  <div className="my-4">
                    <h5>{t("contact_fields")}</h5>
                    <small>{t("contact_fields_message")}</small>
                  </div>

                  <ContactInput
                    name="contacts"
                    elem={["phone", "pec", "support_url", "email"]}
                    errors={errors}
                    serviceMetadata={
                      service.service_metadata
                        ? {
                            phone: service.service_metadata.phone,
                            pec: service.service_metadata.pec,
                            email: service.service_metadata.email,
                            support_url: service.service_metadata.support_url
                          }
                        : {}
                    }
                    onBlur={this.getHandleMetadataBlur}
                  />
                </div>
              </form>

              <form>
                <div className="card-service p-4 my-4">
                  <h5 className="my-4">{t("security_fields")}</h5>
                  <SecurityFields
                    onBlur={this.getHandleBlur}
                    service={service}
                    isApiAdmin={storage.isApiAdmin}
                    showError={showError}
                    errors={errors}
                  />
                </div>
              </form>

              <form>
                <div className="card-service p-4 my-4">
                  <h5 className="my-4">{t("admin_properties")}</h5>
                  <AdminFields
                    onChange={this.handleMetadataChange}
                    onBlur={this.getHandleMetadataBlur}
                    service={service}
                    isApiAdmin={storage.isApiAdmin}
                    showError={showError}
                    errors={errors}
                  />
                </div>
              </form>

              <div className="card-service p-4 my-4 flex">
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
              <div className="my-5">
                <Button
                  color="primary"
                  disabled={
                    !storage.isApiAdmin &&
                    (status === ServiceStatus.REVIEW ||
                      status === ServiceStatus.DEACTIVE)
                  }
                  onClick={this.handleSubmitDraft}
                >
                  {t("save")}
                </Button>
              </div>
            </div>
            {publishService && this.renderPublishServiceModal()}
            {disableService && this.renderDisableServiceModal()}

            {status !== ServiceStatus.VALID &&
            status !== ServiceStatus.DEACTIVE ? (
              <div className="go-live">
                <div className="col-md-12">
                  {status === ServiceStatus.REVIEW && (
                    <Alert color="warning">
                      <span className="dark-text">
                        {t("publish_review_title")}
                      </span>
                      <span>&nbsp; {t("publish_review_message")}</span>
                    </Alert>
                  )}
                  {status === ServiceStatus.REJECTED && (
                    <div>
                      <Alert color="danger">
                        <span className="dark-text">
                          {t("publish_error_title")}
                        </span>
                        <span>&nbsp; {t("publish_error_message")}</span>
                      </Alert>
                      {review && review.comment && (
                        <JiraComments comments={review.comment.comments} />
                      )}
                    </div>
                  )}
                  <h4>Go Live!</h4>
                  <p>{t("publish_message")}</p>
                  <p>
                    {t("publish_guide")}
                    <a href="https://io.italia.it/pubbliche-amministrazioni/">
                      {" "}
                      {t("guide")}
                    </a>
                  </p>
                  <Button
                    color="primary"
                    disabled={
                      status === ServiceStatus.REVIEW || storage.isApiAdmin
                    }
                    onClick={() => this.validateBeforePublish()}
                  >
                    {t("publish")}
                  </Button>
                  <div className="mt-4">
                    <small>{t("publish_info")}</small>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {status === ServiceStatus.VALID ||
            status === ServiceStatus.DEACTIVE ? (
              <div className="go-live">
                <div className="col-md-12">
                  {status === ServiceStatus.VALID && (
                    <Alert color="success">
                      <span className="dark-text">{t("published_title")}</span>
                      <span>&nbsp; {t("published")}</span>
                    </Alert>
                  )}

                  {status === ServiceStatus.DEACTIVE && (
                    <Alert color="info">
                      <span className="dark-text">
                        {t("deactive_service_title")}
                      </span>
                      <span>&nbsp; - {t("deactive_service_message")}</span>
                    </Alert>
                  )}
                  <h4>{t("unpublish_title")}</h4>
                  <p>{t("unpublish_message")}</p>
                  <Button
                    color="primary"
                    disabled={status === ServiceStatus.DEACTIVE}
                    onClick={() => this.setState({ disableService: true })}
                  >
                    {t("unpublish")}
                  </Button>
                  <div className="mt-4">
                    <small>{t("publish_info")}</small>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </React.Fragment>
        )}
      </StorageContext.Consumer>
    ) : null;
  }
}

export default withNamespaces("service")(SubscriptionService);
