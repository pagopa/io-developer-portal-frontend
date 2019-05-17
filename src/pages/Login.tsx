import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

const { localStorage } = window;

import { getFromBackend } from "../utils/backend";
import { getUserTokenOrRedirect } from "../utils/msal";

import "./Login.css";

class Login extends Component<WithNamespaces, never> {
  public componentDidMount = async () => {
    try {
      const configuration = await getFromBackend<any>({
        path: "configuration"
      });
      const user = await getUserTokenOrRedirect(configuration);

      if (user) {
        console.debug(
          "Login::getUserTokenOrRedirect::userToken",
          user.token,
          user.user
        );

        // bearer token to call backend api
        localStorage.setItem("userToken", user.token);
        // profile data (email, name, ...)
        localStorage.setItem("userData", JSON.stringify(user.user.idToken));

        const apimUser = await getFromBackend<any>({ path: "user" });
        console.debug("Login::apimUser", apimUser);

        const isApiAdmin =
          apimUser.apimUser &&
          new Set<string>(apimUser.apimUser.groupNames).has("ApiAdmin");

        localStorage.setItem("isApiAdmin", isApiAdmin.toString());
        window.location.replace("/");
      }
    } catch (e) {
      console.error("Login needed", e);
    }
  };

  public render() {
    const { t } = this.props;

    return (
      <section className="login--container">
        <Alert color="info">{t("message")}</Alert>
      </section>
    );
  }
}

export default withNamespaces("login")(Login);
