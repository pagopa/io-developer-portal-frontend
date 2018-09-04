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

const OPTIONS = {
  headers: {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": localStorage.getItem("serviceKey")
  }
};

module.exports.DEFAULT_URL = DEFAULT_URL;

module.exports.get = ({ url, path, options }) => {
  return fetch(`${url || getUrl()}/${path}`, {
    ...OPTIONS,
    ...options,
    method: "GET"
  }).then(response => response.json());
};

module.exports.post = ({ url, path, options }) => {
  return fetch(`${url || getUrl()}/${path}`, {
    ...OPTIONS,
    ...options,
    method: "POST",
    body: JSON.stringify(options.body)
  }).then(response => response.json());
};
