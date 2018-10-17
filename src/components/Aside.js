import React, { Component } from "react";

import { Link } from "react-router-dom";

import { LinkList, LinkListItem } from "design-react-kit";

import TableHead from "react-icons/lib/fa/th-large";
import Rocket from "react-icons/lib/fa/rocket";
import FileText from "react-icons/lib/fa/file-text-o";
import Envelope from "react-icons/lib/fa/envelope";
import Group from "react-icons/lib/fa/group";
import Inbox from "react-icons/lib/fa/inbox";
import Book from "react-icons/lib/fa/book";
import User from "react-icons/lib/fa/user";

import { StorageContext } from "../context/storage";

import "./Aside.css";

class Aside extends Component {
  render() {
    return (
      <aside>
        <StorageContext.Consumer>
          {storage => (
            <LinkList>
              <li>
                <Link className="large list-item" to={{ pathname: "/" }}>
                  <TableHead className="mr-2 aside--icon" />
                  Dashboard
                </Link>
              </li>
              {storage.isApiAdmin && (
                <li>
                  <Link className="large list-item" to={{ pathname: "/users" }}>
                    <Book className="mr-2 aside--icon" />
                    Utenti registrati
                  </Link>
                </li>
              )}
              <li>
                <Link className="large list-item" to={{ pathname: "/profile" }}>
                  <User className="mr-2 aside--icon" />
                  Profilo (sottoscrizioni)
                </Link>
              </li>
              <li>
                <Link className="large list-item border-top border-custom-grey" to={{ pathname: "/compose" }}>
                  <Rocket className="mr-2 aside--icon" />
                  Invio rapido
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/compose/import" }}
                >
                  <FileText className="mr-2 aside--icon" />
                  Invio da file
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/templates" }}
                >
                  <Envelope className="mr-2 aside--icon" />
                  Invio con Template
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/contacts" }}
                >
                  <Group className="mr-2 aside--icon" />
                  Contatti
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/messages" }}
                >
                  <Inbox className="mr-2 aside--icon" />
                  Messaggi inviati
                </Link>
              </li>
              <li>
                <a href="./openapi.html" className="large list-item border-top border-custom-grey">
                  <Inbox className="mr-2 aside--icon" />
                  Specifiche OpenAPI
                </a>
              </li>
            </LinkList>
          )}
        </StorageContext.Consumer>
      </aside>
    );
  }
}

export default Aside;
