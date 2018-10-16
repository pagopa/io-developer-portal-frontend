/**
 * MSAL (Microsoft authentication library) routines to log in the user
 * using the account registered on the Active Dirctory B2C instance.
 *
 * Configuration comes from the remote endpoint.
 * Needs a promise polyfill for old browsers.
 */
import { UserAgentApplication } from "msal";

export function getDefaultUserAgentApplication(applicationConfig) {
  return new UserAgentApplication(
    applicationConfig.clientID, applicationConfig.authority, (errorDesc, token, error, tokenType) => {
      console.debug("getDefaultUserAgentApplication token", token);
    });
}

export async function getUserToken(configuration) {
  console.debug("getUserTokenOrRedirect::getUserToken");

  const userAgentApplication = getDefaultUserAgentApplication(configuration);
  const token = await userAgentApplication.acquireTokenSilent(configuration.b2cScopes);

  console.debug("getUserTokenOrRedirect::getUserToken::token", token);

  if (!token) {
    throw new Error("getUserToken: cannot get user token");
  }
  return ({
    token,
    user: userAgentApplication.getUser()
  });
}

export async function getUserTokenOrRedirect(configuration) {
  const userAgentApplication = getDefaultUserAgentApplication(configuration);

  const user = userAgentApplication.getUser();
  console.debug("getUserTokenOrRedirect::user", user);

  if (!user) {
    return userAgentApplication.loginRedirect(configuration.b2cScopes);
  }
  try {
    return await getUserToken(configuration);
  }
  catch (e) {
    return userAgentApplication.loginRedirect(configuration.b2cScopes);
  }
}
