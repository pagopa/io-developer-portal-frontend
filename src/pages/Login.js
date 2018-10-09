import { Component } from "react";

const { localStorage } = window;

import { getUserTokenOrRedirect } from "../utils/msal";
import { getFromBackend } from "../utils/backend";

class Login extends Component {
  componentDidMount = async () => {
    try {
      const configuration = await getFromBackend({ path: "configuration" });
      const user = await getUserTokenOrRedirect(configuration);
      // bearer token to call backend api
      localStorage.setItem("userToken", user.token);
      // profile data (email, name, ...)
      localStorage.setItem("userData", JSON.stringify(user.user.idToken));

      const apimUser = await getFromBackend({ path: "user" });
      const isApiAdmin = new Set(apimUser.apimUser.groupNames).has("ApiAdmin");
      localStorage.setItem("isApiAdmin", isApiAdmin);

      window.location.replace("/");
    }
    catch (e) { console.error("Login needed", e) };
  }

  render() {
    return null;
  }
}

export default Login;
