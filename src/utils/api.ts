import { ICustomWindow } from "../customTypes/CustomWindow";

const customWindow = window as ICustomWindow;

export const IO_DEVELOPER_PORTAL_APIM_BASE_URL =
  customWindow._env_.IO_DEVELOPER_PORTAL_APIM_BASE_URL;

export function getUrl() {
  const { localStorage } = window;
  const serviceEndpoint = localStorage.getItem("serviceEndpoint");

  return serviceEndpoint ? serviceEndpoint : IO_DEVELOPER_PORTAL_APIM_BASE_URL;
}

const getOptions = (dbName: string | undefined) => {
  return {
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key":
        dbName || localStorage.getItem("serviceKey") || ""
    }
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

interface GetParams {
  dbName?: string;
  url?: string;
  path: string;
  options?: RequestInit;
}

export function get<T>(params: GetParams): Promise<T> {
  const { dbName, url, path, options } = params;
  return fetch(`${url || getUrl()}/${path}`, {
    ...getOptions(dbName),
    ...options,
    method: "GET"
  })
    .then(response => response.json())
    .then(response => {
      // The API returned an error with shape { message, statusCode }
      if (response.statusCode === 429) {
        // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
        // Attempt to retry
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await get<T>({
              dbName,
              url,
              path,
              options
            });
            resolve(result);
          }, getRetryTimeout(response.message));
        });
      }
      return response;
    });
}

interface PostParams {
  dbName?: string;
  url?: string;
  path: string;
  options: RequestInit;
}

export function post<T>(params: PostParams): Promise<T> {
  const { dbName, url, path, options } = params;
  return fetch(`${url || getUrl()}/${path}`, {
    ...getOptions(dbName),
    ...options,
    method: "POST"
  })
    .then(response => response.json())
    .then(response => {
      // The API returned an error with shape { message, statusCode }
      if (response.statusCode === 429) {
        // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
        // Attempt to retry
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await post<T>({
              dbName,
              url,
              path,
              options
            });
            resolve(result);
          }, getRetryTimeout(response.message));
        });
      }
      return response;
    });
}

export default { IO_DEVELOPER_PORTAL_APIM_BASE_URL, getUrl, get, post };
