/**
 * MSAL (Microsoft authentication library) routines to log in the user
 * using the account registered on the Active Dirctory B2C instance.
 *
 * Configuration comes from the remote endpoint.
 * Needs a promise polyfill for old browsers.
 */
import { UserAgentApplication } from "msal";

export async function getUserTokenOrRedirect(configuration: any) {
  const userAgentApplication = new UserAgentApplication(
    configuration.clientID, configuration.authority, (errorDesc, token, error, tokenType, userState) => {
      console.debug("getDefaultUserAgentApplication::params", errorDesc, token, error, tokenType, userState);
    });

  const user = userAgentApplication.getUser();
  console.debug("getUserTokenOrRedirect::user", user);

  if (!user) {
    console.debug("getUserTokenOrRedirect::loginRedirect");
    return userAgentApplication.loginRedirect(configuration.b2cScopes);
  }

  try {
    const token = await userAgentApplication.acquireTokenSilent(configuration.b2cScopes);
    console.debug("getUserTokenOrRedirect::token", token);

    if (!token) {
      throw new Error("getUserTokenOrRedirect: cannot get user token");
    }
    return ({
      token,
      user: userAgentApplication.getUser()
    });
  }
  catch (e) {
    console.debug("getUserTokenOrRedirect::error", e);
    return userAgentApplication.loginRedirect(configuration.b2cScopes);
  }
}
