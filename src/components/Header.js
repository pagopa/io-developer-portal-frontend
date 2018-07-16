import React, { Component } from "react";

import { Navbar, Collapse, Nav, NavItem, NavLink } from "design-react-kit";

class Header extends Component {
  render() {
    return (
      <header>
        <Navbar expand="lg">
          <Collapse isOpen navbar>
            <Nav navbar>
              <NavItem>
                <NavLink href="/">
                  <i className="it-app mr-3" />
                  IO Backoffice
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}

export default Header;
