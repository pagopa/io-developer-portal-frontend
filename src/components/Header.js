import React, { Component } from "react";

import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { Navbar, Collapse, Nav, NavItem, NavLink } from "design-react-kit";

import SignOut from "react-icons/lib/fa/sign-out";
import Server from "react-icons/lib/fa/server";

class Header extends Component {
  onSignOut = () => {
    localStorage.removeItem("serviceKey");

    this.goHome();
  };

  goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.replace(location);
  };

  render() {
    const userData = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : undefined;
    return (
      <header>
        <Navbar expand="lg">
          <Collapse isOpen navbar>
            <Nav navbar className="justify-content-between">
              <section>
                <NavItem>
                  <NavLink href={process.env.PUBLIC_URL || "/"}>
                    <i className="it-app mr-3" />
                    IO Backoffice
                  </NavLink>
                </NavItem>
              </section>
              <section>
                <Nav>
                  <NavItem className="d-flex">
                    <div className="text-white align-self-center">
                      <Link
                        className="nav-link"
                        to={{ pathname: "/profile" }}
                      >
                        {userData.given_name}{' '}{userData.family_name}
                        {localStorage.getItem("isApiAdmin") ? " (admin)" : ""}
                      </Link>
                    </div>
                  </NavItem>
                  <NavItem>
                    <Link
                      className="nav-link"
                      to={{ pathname: "/config/servers" }}
                    >
                      <Server />
                    </Link>
                  </NavItem>

                  {(() => {
                    const isSignedIn = !!userData;

                    if (isSignedIn) {
                      return (
                        <NavItem
                          className="cursor-pointer"
                          onClick={this.onSignOut}
                        >
                          <NavLink>
                            <SignOut />
                          </NavLink>
                        </NavItem>
                      );
                    }
                  })()}
                </Nav>
              </section>
            </Nav>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}

export default withRouter(Header);
