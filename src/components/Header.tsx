import { Collapse, Nav, Navbar, NavItem, NavLink } from "design-react-kit";
import { get } from "lodash";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import Server from "react-icons/lib/fa/server";
import SignOut from "react-icons/lib/fa/sign-out";
import { Link } from "react-router-dom";
import { MsalConfig } from "../../generated/definitions/backend/MsalConfig";
import { PublicConfig } from "../../generated/definitions/backend/PublicConfig";
import assistenza from "../assets/images/assistenza.svg";
import { StorageContext } from "../context/storage";
import { getFromBackend } from "../utils/backend";
import { getConfig } from "../utils/config";
import * as session from "../utils/session";
import { SelfCareSessionConfig } from "../utils/session/selfcare";
import "./Header.css";

type HeaderState = {
  applicationConfig: PublicConfig;
};

class Header extends Component<WithNamespaces, HeaderState, never> {
  public async componentDidMount() {
    const applicationConfig = await getFromBackend<PublicConfig>({
      path: "configuration"
    });
    this.setState({ applicationConfig });
  }

  public onSignOut = async () => {
    const configuration = await getFromBackend<MsalConfig>({
      path: "configuration"
    });

    session.logout(configuration);
  };

  public render() {
    const { t } = this.props;
    const applicationConfig = get(this.state, "applicationConfig");
    return (
      <header>
        {SelfCareSessionConfig.is({
          ...applicationConfig,
          login_url: "test"
        }) && (
          <div className="header-selfcare selfcare-border-bottom">
            <div className="header-selfcare-container px-4">
              <p className="header-selfcare-title selfcare-text font-weight-bold">
                {"PagoPA S.p.A"}
              </p>
              <div className="d-flex align-items-center">
                <img
                  src={assistenza}
                  alt="assistenza"
                  style={{
                    width: "20px",
                    height: "20px",
                    padding: 0,
                    marginRight: "10px"
                  }}
                  aria-hidden="true"
                />
                <a
                  className="selfcare-text header-selfcare-title"
                  href="mailto:selfcare@assistenza.pagopa.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("assistance")}
                  style={{
                    fontWeight: 600,
                    marginRight: "28px"
                  }}
                >
                  {t("assistance")}
                </a>
                <button
                  className="btn btn-outline-primary header-selfcare-button"
                  onClick={this.onSignOut}
                >
                  {t("exit")}
                </button>
              </div>
            </div>
          </div>
        )}
        <StorageContext.Consumer>
          {storage => (
            <Navbar
              expand="lg"
              className="selfcare-border-bottom"
              style={{ backgroundColor: "white" }}
            >
              <Collapse isOpen={true} navbar={true}>
                <Nav navbar={true} className="justify-content-between">
                  <section>
                    <NavItem>
                      <NavLink
                        href={getConfig("IO_DEVELOPER_PORTAL_BASE_URL") || "/"}
                        style={{ paddingLeft: 0 }}
                      >
                        {storage.service ? (
                          <span>
                            {storage.service.organization_name} (
                            {storage.service.service_name})
                          </span>
                        ) : (
                          <span className="header-app-title">
                            {getConfig("IO_DEVELOPER_PORTAL_TITLE")}
                          </span>
                        )}
                      </NavLink>
                    </NavItem>
                  </section>
                  <section className="d-flex align-items-center">
                    <Nav>
                      <NavItem>
                        <Link
                          className="nav-link color-dark"
                          to={{ pathname: "/config/servers" }}
                        >
                          <Server />
                        </Link>
                      </NavItem>
                      {storage.userData && (
                        <NavItem className="d-flex">
                          <div className="text-white align-self-center">
                            <Link
                              className="nav-link color-dark"
                              to={{ pathname: "/profile" }}
                            >
                              {storage.userData.given_name}{" "}
                              {storage.userData.family_name}
                              {storage.isApiAdmin ? " (admin)" : ""}
                            </Link>
                          </div>
                        </NavItem>
                      )}
                      {storage.userData &&
                        !SelfCareSessionConfig.is({
                          ...applicationConfig,
                          login_url: "test"
                        }) && (
                          <NavItem
                            className="cursor-pointer"
                            onClick={this.onSignOut}
                          >
                            <NavLink className="color-dark">
                              <SignOut />
                            </NavLink>
                          </NavItem>
                        )}
                    </Nav>
                  </section>
                </Nav>
              </Collapse>
            </Navbar>
          )}
        </StorageContext.Consumer>
      </header>
    );
  }
}

export default withNamespaces("header")(Header);
