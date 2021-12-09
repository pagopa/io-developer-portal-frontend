import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { SelfCareConfig } from "../../../generated/definitions/backend/SelfCareConfig";

export type SelfCareSessionConfig = t.TypeOf<typeof SelfCareSessionConfig>;
export const SelfCareSessionConfig = SelfCareConfig;

const redirectToSSO = (configuration: SelfCareSessionConfig): void => {
  window.location.href = configuration.login_url;
};

const parseJwt = (token: string) => {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

const verifyToken = (): Either<
  Error,
  { token: string; payload: Record<string, unknown> }
> => {
  const token = sessionStorage.getItem("userToken");

  if (!token) {
    return left(new Error("No token found"));
  }

  try {
    const payload = parseJwt(token);

    // check is expired
    const exp = new Date(payload.exp * 1000);
    if (exp.getTime() > Date.now()) {
      return left(new Error("Token expired"));
    }

    return right({ token, payload });
  } catch (ex) {
    return left(new Error(`Failed to parse JWT token`));
  }
};

export const getUserTokenOrRedirect = async (
  configuration: SelfCareSessionConfig
): Promise<void | { token: string; payload: Record<string, unknown> }> => {
  const errorOrToken = verifyToken();

  if (isLeft(errorOrToken)) {
    return redirectToSSO(configuration);
  }

  return errorOrToken.value;
};
