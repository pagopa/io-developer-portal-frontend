import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { SelfCareConfig } from "../../../generated/definitions/backend/SelfCareConfig";

export type SelfCareSessionConfig = t.TypeOf<typeof SelfCareSessionConfig>;
export const SelfCareSessionConfig = SelfCareConfig;

const redirectToSSO = (configuration: SelfCareSessionConfig): void => {
  // tslint:disable-next-line:no-object-mutation
  window.location.href = configuration.login_url;
};

const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
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
    if (exp.getTime() <= Date.now()) {
      return left(new Error("Token expired"));
    }

    return right({ token, payload });
  } catch (ex) {
    return left(new Error(`Failed to parse JWT token`));
  }
};

// search for an id token in the url hash
// if found, the token is stored in the session storage and removed from hash
const readTokenFromHash = (): void => {
  // we expect a hash in the shape
  // #key1=value1&key2=value2
  const idToken = window.location.hash
    .slice(1 /* remove '#' char */)
    .split("&")
    .map(e => e.split("="))
    .filter(([k]) => k === "id_token")
    .map(([, value]) => value)[0];

  if (idToken) {
    sessionStorage.setItem("userToken", idToken);
    // redirect to same page without hash
    // tslint:disable-next-line:no-object-mutation
    window.location.href = window.location.href.replace(
      window.location.hash,
      ""
    );
  }
};

export const getUserTokenOrRedirect = async (
  configuration: SelfCareSessionConfig
): Promise<void | { token: string; payload: Record<string, unknown> }> => {
  // check if an id token is passed
  // if so, it means we're coming from a login process, thus we store incoming token into session storage
  readTokenFromHash();
  const errorOrToken = verifyToken();

  if (isLeft(errorOrToken)) {
    return redirectToSSO(configuration);
  }

  return errorOrToken.value;
};
