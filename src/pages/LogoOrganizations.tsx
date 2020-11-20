import React, { ChangeEvent, Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { StorageContext } from "../context/storage";
import { putToBackend } from "../utils/backend";

import * as ts from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { OrganizationFiscalCode } from "../../generated/definitions/api/OrganizationFiscalCode";
import UploadLogo from "../components/UploadLogo";
import { getConfig } from "../utils/config";
import { getBase64OfImage } from "../utils/image";

import { Input } from "design-react-kit";

const LogoParamsApi = ts.interface({
  logo: NonEmptyString,
  organizationFiscalCode: OrganizationFiscalCode
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

const ORGANIZATIONS_LOGO_PATH =
  getConfig("IO_DEVELOPER_PORTAL_LOGO_PATH") + "/organizations/";

type OwnProps = {};
type Props = WithNamespaces & OwnProps;

type LogoState = {
  errorLogoUpload: boolean;
  logo?: string;
  logoIsValid: boolean;
  logoUploaded: boolean;
  organizationFiscalCode?: OrganizationFiscalCode;
  organizationFiscalCodeIsValid: boolean;
};

class LogoOrganizations extends Component<Props, LogoState> {
  public state: LogoState = {
    errorLogoUpload: false,
    logo: undefined,
    logoIsValid: true,
    logoUploaded: false,
    organizationFiscalCode: undefined,
    organizationFiscalCodeIsValid: true
  };

  public handleServiceLogoSubmit = async () => {
    LogoParamsApi.decode({
      logo: this.state.logo,
      organizationFiscalCode: this.state.organizationFiscalCode
    }).fold(
      _ =>
        this.setState({
          logo: undefined,
          logoIsValid: false,
          logoUploaded: false
        }),
      async logoParamsApi => {
        const responseOrError = await putToBackend({
          path: `organizations/${logoParamsApi.organizationFiscalCode}/logo`,
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

  public handleOrganizazionFiscalCodeChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const {
      target: { value }
    } = event;

    OrganizationFiscalCode.decode(value).fold(
      _ => this.setState({ organizationFiscalCodeIsValid: false }),
      validOrganizationFiscalCode =>
        this.setState({
          organizationFiscalCode: validOrganizationFiscalCode,
          organizationFiscalCodeIsValid: true
        })
    );
  };

  public render() {
    const {
      errorLogoUpload,
      logo,
      logoIsValid,
      logoUploaded,
      organizationFiscalCode,
      organizationFiscalCodeIsValid
    } = this.state;
    const { t } = this.props;
    const logoId: string = organizationFiscalCode
      ? organizationFiscalCode.toString()
      : "";

    return (
      <StorageContext.Consumer>
        {storage =>
          storage.isApiAdmin && (
            <div>
              <form className="mb-5 mt-1">
                <div className="shadow p-4">
                  <h5>{t("service_logo")}</h5>
                  <label className="m-0">
                    {t("organization_fiscal_code")}*
                  </label>
                  <Input
                    name="organization_fiscal_code"
                    type="text"
                    defaultValue={organizationFiscalCode}
                    onChange={this.handleOrganizazionFiscalCodeChange}
                    className="mb-4"
                  />
                  {!organizationFiscalCodeIsValid && (
                    <div className="invalid-feedback d-block">
                      {t("validation:fiscal_code", { max: 11 })}
                    </div>
                  )}
                  <UploadLogo
                    errorLogoUpload={errorLogoUpload}
                    isSubmitEnabled={
                      organizationFiscalCode !== undefined &&
                      organizationFiscalCodeIsValid &&
                      logo !== undefined &&
                      logoIsValid
                    }
                    isValid={logoIsValid}
                    logoPath={`${ORGANIZATIONS_LOGO_PATH}/organization/${logoId}`}
                    logoUploaded={logoUploaded}
                    nameButton="service_logo_upload"
                    nameInput="service_logo"
                    onChangeHandler={this.handleServiceLogoChange}
                    onError={this.handleOnErrorImage}
                    onSubmitHandler={this.handleServiceLogoSubmit}
                  />
                </div>
              </form>
            </div>
          )
        }
      </StorageContext.Consumer>
    );
  }
}

export default withNamespaces("logoOrganizations")(LogoOrganizations);
