import { MsalConfig } from "../../../generated/definitions/backend/MsalConfig";
import { getUserAgentApplication, getUserTokenOrRedirect } from "./msal";

/**
 * The shape of configuration for the current session strategy
 */
export type SessionConfig = MsalConfig; // will include more kinds in the future

export type LoggedUserData = {};

/**
 * Clear and invalidates current session data
 *
 * @param configuration
 * @returns
 */
export const logout = (configuration: SessionConfig): void => {
  sessionStorage.clear();
  return getUserAgentApplication(configuration).logout();
};

/**
 * Get session data or redirect to login page
 *
 * @param configuration
 * @returns
 */
export const getSessionOrLogin = async (
  configuration: SessionConfig
): Promise<undefined | { token: string; userData: LoggedUserData }> => {
  const tokenAndAccount = await getUserTokenOrRedirect(configuration);

  if (tokenAndAccount) {
    return {
      token: tokenAndAccount.token,
      userData: tokenAndAccount.account.idToken
    };
  }
  return undefined;
};
