export const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://apim-portal-prod.azurewebsites.net"
    : "https://apim-portal-dev.azurewebsites.net";

export const getBackendUrl = () =>
  window.localStorage.getItem("backendEndpoint") || DEFAULT_BACKEND_URL;

const getOptions = (token: string) => {
  const defaultToken = localStorage.getItem("userToken");
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

    return isFinite(digits) ? digits * 1000 : 1 * 1000;
  } catch (error) {
    return 1 * 1000;
  }
};

interface GetFromBackendParams {
  url?: any;
  path: any;
  token?: any;
  options?: any;
}

export const getFromBackend = async (params: GetFromBackendParams) => {
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
    return new Promise<any>(resolve => {
      setTimeout(async () => {
        const result = await getFromBackend({
          token,
          url,
          path,
          options
        });
        resolve(result);
      }, getRetryTimeout(jsonRes.message));
    });
  }
  return jsonRes;
};

interface PostToBackendParams {
  url?: any;
  path: any;
  token?: any;
  options: any;
}

export const postToBackend = (params: PostToBackendParams) =>
  toBackend(params, "POST");

interface PutToBackendParams {
  url?: any;
  path: any;
  token?: any;
  options: any;
}

export const putToBackend = (params: PutToBackendParams) =>
  toBackend(params, "PUT");

async function toBackend(
  params: PostToBackendParams | PutToBackendParams,
  method: "POST" | "PUT"
) {
  const { url, path, token, options } = params;
  const response = await fetch(`${url || getBackendUrl()}/${path}`, {
    ...getOptions(token),
    ...options,
    method,
    body: JSON.stringify(options.body)
  });
  const jsonRes = await response.json();
  // The API returned an error with shape { message, statusCode }
  if (jsonRes.statusCode === 429) {
    // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
    // Attempt to retry
    return new Promise<any>(resolve => {
      setTimeout(async () => {
        // TODO: check if it should always be postToBackend even when method is PUT
        const result = await postToBackend({
          token,
          url,
          path,
          options
        });
        resolve(result);
      }, getRetryTimeout(jsonRes.message));
    });
  }
  return jsonRes;
}
