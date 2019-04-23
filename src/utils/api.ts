export let DEFAULT_URL = "";
if (process.env.NODE_ENV === "production") {
  DEFAULT_URL = "https://api.cd.italia.it/api/v1";
} else {
  // Uses `api-proxy.ts`
  DEFAULT_URL = "http://localhost:3000";
}

export function getUrl(){
  const { localStorage } = window;
  const serviceEndpoint = localStorage.getItem("serviceEndpoint");

  let URL = "";
  if (serviceEndpoint) {
    URL = serviceEndpoint;
  } else {
    URL = DEFAULT_URL;
  }
  return URL;
};

const getOptions = (dbName: string) => {
  const OPTIONS = {
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": dbName || localStorage.getItem("serviceKey")
    }
  };

  return OPTIONS;
};

interface GetParams{
  dbName?: any;
  url?: any;
  path: any;
  options?:any
}

export function get(params: GetParams){
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
            const result = await get({
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
};

interface PostParams{
  dbName?: any;
  url?: any;
  path: any;
  options: any;
}

export function post(params: PostParams) {
  const { dbName, url, path, options } = params;
  return fetch(`${url || getUrl()}/${path}`, {
    ...getOptions(dbName),
    ...options,
    method: "POST",
    body: JSON.stringify(options.body)
  })
    .then(response => response.json())
    .then(response => {
      // The API returned an error with shape { message, statusCode }
      if (response.statusCode === 429) {
        // { statusCode: 429, message: "Rate limit is exceeded. Try again in X seconds." }
        // Attempt to retry
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await post({
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
};

const getRetryTimeout = (message: string) => {
  try {
    const messageMatch = message.match(/\d+ seconds/g);
    if (!messageMatch) throw new Error();
    const string = messageMatch[0];
    const stringMatch = string.match(/\d+/);
    if (!stringMatch) throw new Error();
    const digits = Number(stringMatch[0]);
    return isFinite(digits) ? digits * 1000 : 1 * 1000;
  } catch (error) {
    return 1 * 1000;
  }
};

export default { DEFAULT_URL, getUrl, get, post }