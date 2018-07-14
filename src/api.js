const BASE_URL = "https://api.cd.italia.it/api/v1";
const PROXIED_URL = "http://localhost:3000";

const OPTIONS = {
  headers: {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": localStorage.getItem("apiKey")
  }
};

module.exports.get = ({ path, options }) => {
  return fetch(`${PROXIED_URL}/${path}`, {
    ...OPTIONS,
    ...options,
    method: "GET"
  }).then(response => response.json());
};

module.exports.post = ({ path, options }) => {
  return fetch(`${PROXIED_URL}/${path}`, {
    ...OPTIONS,
    ...options,
    method: "POST",
    body: JSON.stringify(options.body)
  }).then(response => response.json());
};
