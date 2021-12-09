/**
 * MSAL (Microsoft authentication library) routines to log in the user
 * using the account registered on the Active Dirctory B2C instance.
 *
 * Configuration comes from the remote endpoint.
 * Needs a promise polyfill for old browsers.
 */
import { UserAgentApplication } from "msal";
import { MsalConfig } from "../../../generated/definitions/backend/MsalConfig";

export function getUserAgentApplication(configuration: MsalConfig) {
  return new UserAgentApplication({
    auth: {
      clientId: configuration.clientID,
      authority: configuration.authority,
      validateAuthority: false
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: true
    }
  });
}

export async function getUserTokenOrRedirect(configuration: MsalConfig) {
  const userAgentApplication = getUserAgentApplication(configuration);

  userAgentApplication.handleRedirectCallback((authError, authResponse) => {
    console.debug("getUserTokenOrRedirect::params", authError, authResponse);
  });

  const account = userAgentApplication.getAccount();
  console.debug("getUserTokenOrRedirect::account", account);

  if (userAgentApplication.isCallback(window.location.hash)) {
    return;
  }

  if (!account) {
    console.debug("getUserTokenOrRedirect::loginRedirect");
    return userAgentApplication.loginRedirect({
      scopes: [...configuration.b2cScopes]
    });
  }

  try {
    const authResponse = await userAgentApplication.acquireTokenSilent({
      scopes: [...configuration.b2cScopes]
    });
    console.debug("getUserTokenOrRedirect::authResponse", authResponse);

    return {
      token: authResponse.accessToken,
      account: userAgentApplication.getAccount()
    };
  } catch (e) {
    console.debug("getUserTokenOrRedirect::error", e);
    return userAgentApplication.acquireTokenRedirect({
      scopes: [...configuration.b2cScopes]
    });
  }
}
