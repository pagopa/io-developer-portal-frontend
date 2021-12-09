import { MsalConfig } from "../../../generated/definitions/backend/MsalConfig";
import { getUserAgentApplication, getUserTokenOrRedirect } from "./msal";
import { some, none, Option } from "fp-ts/lib/Option";

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
): Promise<Option<{ token: string; userData: LoggedUserData }>> => {
  const tokenAndAccount = await getUserTokenOrRedirect(configuration);

  if (tokenAndAccount) {
    return some({
      token: tokenAndAccount.token,
      userData: tokenAndAccount.account.idToken
    });
  }
  return none;
};
