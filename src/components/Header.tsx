import { Collapse, Nav, Navbar, NavItem, NavLink } from "design-react-kit";
import { get } from "lodash";
import React, { Component } from "react";
import Server from "react-icons/lib/fa/server";
import SignOut from "react-icons/lib/fa/sign-out";
import { withRouter } from "react-router";
import { Link, RouteComponentProps } from "react-router-dom";
import { MsalConfig } from "../../generated/definitions/backend/MsalConfig";
import { PublicConfig } from "../../generated/definitions/backend/PublicConfig";
import { StorageContext } from "../context/storage";
import { getFromBackend } from "../utils/backend";
import { getConfig } from "../utils/config";
import * as session from "../utils/session";
import { SelfCareSessionConfig } from "../utils/session/selfcare";
import "./Header.css";

type HeaderState = {
  applicationConfig: PublicConfig;
};

class Header extends Component<RouteComponentProps, HeaderState, never> {
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

  public goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.replace(location);
  };

  public render() {
    const applicationConfig = get(this.state, "applicationConfig");
    return (
      <header>
        {SelfCareSessionConfig.is(applicationConfig) && (
          <div className="header-selfcare">
            <div className="header-selfcare-container">
              <p className="header-selfcare-title font-weight-bold">
                {"PagoPA S.p.A"}
              </p>
            </div>
          </div>
        )}
        <StorageContext.Consumer>
          {storage => (
            <Navbar expand="lg" className="bg-primary">
              <Collapse isOpen={true} navbar={true}>
                <Nav navbar={true} className="justify-content-between">
                  <section>
                    <NavItem>
                      <NavLink
                        href={getConfig("IO_DEVELOPER_PORTAL_BASE_URL") || "/"}
                      >
                        <i className="it-app mr-3" />
                        {storage.service ? (
                          <span>
                            {storage.service.organization_name} (
                            {storage.service.service_name})
                          </span>
                        ) : (
                          <span>{getConfig("IO_DEVELOPER_PORTAL_TITLE")}</span>
                        )}
                      </NavLink>
                    </NavItem>
                  </section>
                  <section>
                    <Nav>
                      <NavItem>
                        <Link
                          className="nav-link"
                          to={{ pathname: "/config/servers" }}
                        >
                          <Server />
                        </Link>
                      </NavItem>
                      {storage.userData && (
                        <NavItem className="d-flex">
                          <div className="text-white align-self-center">
                            <Link
                              className="nav-link"
                              to={{ pathname: "/profile" }}
                            >
                              {storage.userData.given_name}{" "}
                              {storage.userData.family_name}
                              {storage.isApiAdmin ? " (admin)" : ""}
                            </Link>
                          </div>
                        </NavItem>
                      )}
                      {storage.userData && (
                        <NavItem
                          className="cursor-pointer"
                          onClick={this.onSignOut}
                        >
                          <NavLink>
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

export default withRouter(Header);
