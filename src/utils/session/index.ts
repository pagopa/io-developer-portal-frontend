import { none, Option, some } from "fp-ts/lib/Option";
import { MsalConfig } from "../../../generated/definitions/backend/MsalConfig";
import { PublicConfig } from "../../../generated/definitions/backend/PublicConfig";
import {
  getUserAgentApplication,
  getUserTokenOrRedirect as getUserTokenOrRedirectMSAL
} from "./msal";
import { getUserTokenOrRedirect as getUserTokenOrRedirectSC } from "./selfcare";

/**
 * The shape of configuration for the current session strategy
 */
export type SessionConfig = PublicConfig;

export type LoggedUserData = Record<string, unknown>;

/**
 * Clear and invalidates current session data
 *
 * @param configuration
 * @returns
 */
export const logout = (configuration: SessionConfig): void => {
  sessionStorage.clear();
  if (MsalConfig.is(configuration)) {
    return getUserAgentApplication(configuration).logout();
  }
  return;
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
  if (MsalConfig.is(configuration)) {
    const tokenAndAccount = await getUserTokenOrRedirectMSAL(configuration);
    if (tokenAndAccount) {
      return some({
        token: tokenAndAccount.token,
        userData: tokenAndAccount.account.idToken
      });
    }
  } else {
    const tokenAndAccount = await getUserTokenOrRedirectSC(configuration);
    if (tokenAndAccount) {
      return some({
        token: tokenAndAccount.token,
        userData: tokenAndAccount.payload
      });
    }
  }

  return none;
};
