import React, { Component } from "react";
import { isSome } from "fp-ts/lib/Option";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

const { sessionStorage } = window;

import { getFromBackend } from "../utils/backend";
import { getSessionOrLogin } from "../utils/session";

import { MsalConfig } from "../../generated/definitions/backend/MsalConfig";
import { UserData } from "../../generated/definitions/backend/UserData";

import "./Login.css";

class Login extends Component<WithNamespaces, never> {
  public componentDidMount = async () => {
    try {
      const configuration = await getFromBackend<MsalConfig>({
        path: "configuration"
      });
      const maybeTokenAndAccount = await getSessionOrLogin(configuration);

      if (isSome(maybeTokenAndAccount)) {
        console.debug(
          "Login::getUserTokenOrRedirect::tokenAndAccount",
          maybeTokenAndAccount
        );

        // bearer token to call backend api
        sessionStorage.setItem("userToken", maybeTokenAndAccount.value.token);
        // profile data (email, name, ...)
        sessionStorage.setItem(
          "userData",
          JSON.stringify(maybeTokenAndAccount.value.userData)
        );

        const apimUser = await getFromBackend<UserData>({ path: "user" });
        console.debug("Login::apimUser", apimUser);

        const isApiAdmin =
          (apimUser.apimUser &&
            new Set<string>(apimUser.apimUser.groupNames).has("apiadmin")) ===
          true;

        sessionStorage.setItem("isApiAdmin", isApiAdmin.toString());
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
