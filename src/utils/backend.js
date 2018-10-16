export const DEFAULT_BACKEND_URL = process.env.NODE_ENV === "production" ?
  "https://apim-portal-prod.azurewebsites.net" :
  "https://apim-portal-dev.azurewebsites.net";

export const getBackendUrl = () => window.localStorage.getItem("backendEndpoint") || DEFAULT_BACKEND_URL;

const getOptions = token => {
  const defaultToken = localStorage.getItem("userToken");
  const OPTIONS = {
    headers: Object.assign({}, {
      "Content-Type": "application/json",
    }, token ? { Authorization: "Bearer " + token } : (defaultToken ? { Authorization: "Bearer " + defaultToken } : {}))
  };
  return OPTIONS;
};

export const getFromBackend = async ({ url, path, token, options }) => {
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
    return new Promise(resolve => {
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

export const postToBackend = async ({ url, path, token, options }) => {
  const response = await fetch(`${url || getBackendUrl()}/${path}`, {
    ...getOptions(token),
    ...options,
    method: "POST",
    body: JSON.stringify(options.body)
  });
  const jsonRes = await response.json();
  // The API returned an error with shape { message, statusCode }
  if (jsonRes.statusCode === 429) {
    // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
    // Attempt to retry
    return new Promise(resolve => {
      setTimeout(async () => {
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
};

export const putToBackend = async ({ url, path, token, options }) => {
  const response = await fetch(`${url || getBackendUrl()}/${path}`, {
    ...getOptions(token),
    ...options,
    method: "PUT",
    body: JSON.stringify(options.body)
  });
  const jsonRes = await response.json();
  // The API returned an error with shape { message, statusCode }
  if (jsonRes.statusCode === 429) {
    // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
    // Attempt to retry
    return new Promise(resolve => {
      setTimeout(async () => {
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
};

const getRetryTimeout = message => {
  const string = message.match(/\d+ seconds/g)[0];
  const digits = string.match(/\d+/)[0];

  return isFinite(digits) ? digits * 1000 : 1 * 1000;
};
