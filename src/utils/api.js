let DEFAULT_URL = "";
if (process.env.NODE_ENV === "production") {
  DEFAULT_URL = "https://api.cd.italia.it/api/v1";
} else {
  // Uses `api-proxy.js`
  DEFAULT_URL = "http://localhost:3000";
}

const getUrl = () => {
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

module.exports.getUrl = getUrl;

const getOptions = dbName => {
  const OPTIONS = {
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": dbName || localStorage.getItem("serviceKey")
    }
  };

  return OPTIONS;
};

module.exports.DEFAULT_URL = DEFAULT_URL;

const get = ({ dbName, url, path, options }) => {
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

module.exports.get = get;

const post = ({ dbName, url, path, options }) => {
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

module.exports.post = post;

const getRetryTimeout = message => {
  const string = message.match(/\d+ seconds/g)[0];
  const digits = string.match(/\d+/)[0];

  return isFinite(digits) ? digits * 1000 : 1 * 1000;
};
