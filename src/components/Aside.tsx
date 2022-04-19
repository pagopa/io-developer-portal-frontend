import { LinkList } from "design-react-kit";
import React, { Component } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import Book from "react-icons/lib/fa/book";
import Envelope from "react-icons/lib/fa/envelope";
import FileText from "react-icons/lib/fa/file-text-o";
import Group from "react-icons/lib/fa/group";
import Image from "react-icons/lib/fa/image";
import Inbox from "react-icons/lib/fa/inbox";
import Rocket from "react-icons/lib/fa/rocket";
import TableHead from "react-icons/lib/fa/th-large";
import User from "react-icons/lib/fa/user";
import { Link } from "react-router-dom";
import { StorageContext } from "../context/storage";
import "./Aside.css";

class Aside extends Component<WithNamespaces, never> {
  public render() {
    const { t } = this.props;

    return (
      <aside
        style={{
          position: "static",
          minHeight: "unset",
          height: "unset"
        }}
      >
        <StorageContext.Consumer>
          {storage => (
            <LinkList>
              <li>
                <Link className="large list-item" to={{ pathname: "/" }}>
                  <TableHead className="mr-2 aside--icon" />
                  {t("dashboard")}
                </Link>
              </li>
              {storage.isApiAdmin && (
                <li>
                  <Link className="large list-item" to={{ pathname: "/users" }}>
                    <Book className="mr-2 aside--icon" />
                    {t("users")}
                  </Link>
                </li>
              )}
              <li>
                <Link className="large list-item" to={{ pathname: "/profile" }}>
                  <User className="mr-2 aside--icon" />
                  {t("profile")}
                </Link>
              </li>
              <li>
                <Link className="large list-item" to={{ pathname: "/compose" }}>
                  <Rocket className="mr-2 aside--icon" />
                  {t("send")}
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/compose/import" }}
                >
                  <FileText className="mr-2 aside--icon" />
                  {t("send_from_file")}
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/templates" }}
                >
                  <Envelope className="mr-2 aside--icon" />
                  {t("send_from_template")}
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/contacts" }}
                >
                  <Group className="mr-2 aside--icon" />
                  {t("contacts")}
                </Link>
              </li>
              <li>
                <Link
                  className="large list-item"
                  to={{ pathname: "/messages" }}
                >
                  <Inbox className="mr-2 aside--icon" />
                  {t("sent")}
                </Link>
              </li>
              <li>
                <a href="./openapi.html" className="large list-item">
                  <Inbox className="mr-2 aside--icon" />
                  {t("openapi")}
                </a>
              </li>
              {storage.isApiAdmin && (
                <li>
                  <Link
                    className="large list-item"
                    to={{ pathname: "/logo/organizations" }}
                  >
                    <Image className="mr-2 aside--icon" />
                    {t("logo_organization")}
                  </Link>
                </li>
              )}
            </LinkList>
          )}
        </StorageContext.Consumer>
      </aside>
    );
  }
}

export default withNamespaces("aside")(Aside);
