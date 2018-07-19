import React, { Component } from "react";

import { Link } from "react-router-dom";

import { LinkList, LinkListItem } from "design-react-kit";

class Header extends Component {
  render() {
    return (
      <aside>
        <LinkList>
          <li>
            <Link className="large list-item" to={{ pathname: "/" }}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link className="large list-item" to={{ pathname: "/templates" }}>
              Template
            </Link>
          </li>
          <li>
            <Link className="large list-item" to={{ pathname: "/messages" }}>
              Messaggi
            </Link>
          </li>
          <li>
            <Link className="large list-item" to={{ pathname: "/contacts" }}>
              Contatti
            </Link>
          </li>
        </LinkList>
      </aside>
    );
  }
}

export default Header;
