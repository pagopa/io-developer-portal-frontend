import { getConfig } from "./config";

export const IO_DEVELOPER_PORTAL_BACKEND = getConfig(
  "IO_DEVELOPER_PORTAL_BACKEND"
);

export const getBackendUrl = () =>
  window.sessionStorage.getItem("backendEndpoint") ||
  IO_DEVELOPER_PORTAL_BACKEND;

const getOptions = (token?: string) => {
  const defaultToken = sessionStorage.getItem("userToken");
  return {
    headers: Object.assign(
      {},
      {
        "Content-Type": "application/json"
      },
      token
        ? { Authorization: "Bearer " + token }
        : defaultToken
        ? { Authorization: "Bearer " + defaultToken }
        : {}
    )
  };
};

const getRetryTimeout = (message: string) => {
  try {
    const messageMatch = message.match(/\d+ seconds/g);
    if (!messageMatch) {
      throw new Error();
    }
    const messageString = messageMatch[0];
    const stringMatch = messageString.match(/\d+/);
    if (!stringMatch) {
      throw new Error();
    }
    const digits = Number(stringMatch[0]);

    return isFinite(digits) ? digits * 1000 : 1000;
  } catch (error) {
    return 1000;
  }
};

interface GetFromBackendParams {
  url?: string;
  path: string;
  token?: string;
  options?: RequestInit;
}

export const getFromBackend = async <T>(params: GetFromBackendParams) => {
  const { url, path, token, options } = params;
  const response = await fetch(`${url || getBackendUrl()}/${path}`, {
    ...getOptions(token),
    ...options,
    method: "GET"
  });

  // The API returned an error with shape { message, statusCode }
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("needs login");
  }

  const jsonRes = await response.json();
  if (jsonRes.statusCode === 429) {
    // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
    // Attempt to retry
    return new Promise<T>(resolve => {
      setTimeout(async () => {
        const result = await getFromBackend<T>({
          token,
          url,
          path,
          options
        });
        resolve(result);
      }, getRetryTimeout(jsonRes.message));
    });
  }
  return jsonRes as T;
};

interface PostToBackendParams {
  url?: string;
  path: string;
  token?: string;
  options: RequestInit;
}

export const postToBackend = <T>(params: PostToBackendParams) =>
  toBackend<T>(params, "POST");

interface PutToBackendParams {
  url?: string;
  path: string;
  token?: string;
  options: RequestInit;
}

export const putToBackend = <T>(params: PutToBackendParams) =>
  toBackend<T>(params, "PUT");

async function toBackend<T>(
  params: PostToBackendParams | PutToBackendParams,
  method: "POST" | "PUT"
) {
  const { url, path, token, options } = params;
  const response = await fetch(`${url || getBackendUrl()}/${path}`, {
    ...getOptions(token),
    ...options,
    method
  });
  const jsonRes = await response.json();
  // The API returned an error with shape { message, statusCode }
  if (jsonRes.statusCode === 429) {
    // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
    // Attempt to retry
    return new Promise<T>(resolve => {
      setTimeout(async () => {
        // TODO: check if it should always be postToBackend even when method is PUT
        const result = await postToBackend<T>({
          token,
          url,
          path,
          options
        });
        resolve(result);
      }, getRetryTimeout(jsonRes.message));
    });
  }
  return jsonRes as T;
}
