import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";

import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { Collapse, Nav, Navbar, NavItem, NavLink } from "design-react-kit";

import Server from "react-icons/lib/fa/server";
import SignOut from "react-icons/lib/fa/sign-out";

import { StorageContext } from "../context/storage";

class Header extends Component<RouteComponentProps, never> {
  public onSignOut = () => {
    localStorage.removeItem("userData");

    this.goHome();
  };

  public goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.replace(location);
  };

  public render() {
    return (
      <header>
        <StorageContext.Consumer>
          {storage => (
            <Navbar expand="lg">
              <Collapse isOpen={true} navbar={true}>
                <Nav navbar={true} className="justify-content-between">
                  <section>
                    <NavItem>
                      <NavLink href={process.env.PUBLIC_URL || "/"}>
                        <i className="it-app mr-3" />
                        {storage.service ? (
                          <span>
                            {storage.service.organization_name} (
                            {storage.service.service_name})
                          </span>
                        ) : (
                          <span>IO Backoffice</span>
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
