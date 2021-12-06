import { MsalConfig } from "../../../generated/definitions/backend/MsalConfig";
import { getUserAgentApplication } from "./msal";

/**
 * The shape of configuration for the curretn session strategy
 */
export type SessionConfig = MsalConfig; // will include more kinds in the future

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
