import { get } from "lodash";
import React, { Component } from "react";
import { withNamespaces, WithNamespaces } from "react-i18next";
import { PublicConfig } from "../../generated/definitions/backend/PublicConfig";
import pagopaLogo from "../assets/images/logo-pagopa-spa.svg";
import { getFromBackend } from "../utils/backend";
import { SelfCareSessionConfig } from "../utils/session/selfcare";
import "./Footer.css";

type FooterState = {
  applicationConfig: PublicConfig;
};

class Footer extends Component<WithNamespaces, FooterState, never> {
  public async componentDidMount() {
    const applicationConfig = await getFromBackend<PublicConfig>({
      path: "configuration"
    });
    this.setState({ applicationConfig });
  }

  public render() {
    const { t } = this.props;
    const applicationConfig = get(this.state, "applicationConfig");
    return (
      <>
        {SelfCareSessionConfig.is({
          ...applicationConfig,
          login_url: "test"
        }) && (
          <footer className="footer-selfcare d-flex">
            <div className="footer-selfcare-container d-flex flex-column pt-4">
              <div className="footer-selfcare-info d-flex justify-content-between align-items-start mb-3">
                <div className="footer-selfcare-logo">
                  <img
                    src={pagopaLogo}
                    alt="pagoPA"
                    style={{ width: "119px", height: "28px", padding: 0 }}
                    aria-hidden="true"
                  />
                </div>
                <div className="d-flex flex-column">
                  <div className="footer-selfcare-description">
                    {t("pagopaInfo")}
                  </div>
                  <div className="footer-selfcare-description">
                    {t("pagopaInfoCF")}
                  </div>
                </div>
              </div>
              <div className="pl-2">
                <a
                  className="footer-selfcare-link"
                  href="https:/pagopa.it/it/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("privacyPolicy")}
                >
                  {t("privacyPolicy")}
                </a>
                <a
                  className="footer-selfcare-link ml-3"
                  href="https:/pagopa.it/it/termini-e-condizioni-di-utilizzo-del-sito/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("privacyPolicy")}
                >
                  {t("terms")}
                </a>
                <a
                  className="footer-selfcare-link ml-3"
                  href="https:/pagopa.it/it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("privacyPolicy")}
                >
                  {t("security")}
                </a>
                <a
                  className="footer-selfcare-link ml-3"
                  href="https:/dev.selfcare.pagopa.it/assistenza"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("privacyPolicy")}
                >
                  {t("assistance")}
                </a>
              </div>
            </div>
          </footer>
        )}
      </>
    );
  }
}

export default withNamespaces("footer")(Footer);
