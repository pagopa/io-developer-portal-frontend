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
        {SelfCareSessionConfig.is(applicationConfig) && (
          <footer className="selfcare-border-top d-flex">
            <div className="w-100 d-flex flex-column">
              <div className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <img
                    src={pagopaLogo}
                    alt="pagoPA"
                    style={{
                      width: "119px",
                      height: "32px",
                      padding: 0,
                      border: "none"
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <a
                    className="footer-selfcare-link selfcare-text"
                    href="https:/pagopa.it/it/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("privacyPolicy")}
                  >
                    {t("privacyPolicy")}
                  </a>
                  <a
                    className="footer-selfcare-link selfcare-text ml-4"
                    href="https:/pagopa.it/it/termini-e-condizioni-di-utilizzo-del-sito/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("terms")}
                  >
                    {t("terms")}
                  </a>
                  <a
                    className="footer-selfcare-link selfcare-text ml-4"
                    href="https://form.agid.gov.it/view/7628e161-33c0-420f-8c80-4fe362d2c7c5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("accessibility")}
                  >
                    {t("accessibility")}
                  </a>
                </div>
              </div>
              <div className="selfcare-border-top p-3 d-flex justify-content-center align-items-center">
                <div className="footer-selfcare-description selfcare-text px-2 d-flex flex-row justify-content-center">
                  {t("pagopaInfo")}
                </div>
              </div>
            </div>
          </footer>
        )}
      </>
    );
  }
}

export default withNamespaces("footer")(Footer);
