import React, { Component } from "react";

import { withRouter } from "react-router";

import { Navbar, Collapse, Nav, NavItem, NavLink } from "design-react-kit";

import SignOut from "react-icons/lib/fa/sign-out";

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
    return (
      <header>
        <Navbar expand="lg">
          <Collapse isOpen navbar>
            <Nav navbar className="justify-content-between">
              <NavItem>
                <NavLink href={process.env.PUBLIC_URL || "/"}>
                  <i className="it-app mr-3" />
                  IO Backoffice
                </NavLink>
              </NavItem>
              {(() => {
                const isSignedIn = !!localStorage.getItem("serviceKey");

                if (isSignedIn) {
                  return (
                    <NavItem
                      className="cursor-pointer"
                      onClick={this.onSignOut}
                    >
                      <NavLink href={process.env.PUBLIC_URL}>
                        <SignOut />
                      </NavLink>
                    </NavItem>
                  );
                }
              })()}
            </Nav>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}

export default withRouter(Header);
