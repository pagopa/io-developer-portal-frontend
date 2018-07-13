const BASE_URL = "https://api.cd.italia.it/api/v1";
const PROXIED_URL = "http://localhost:3000";

const OPTIONS = {
  headers: {
    "Ocp-Apim-Subscription-Key": localStorage.getItem("apiKey")
  }
};

module.exports.get = ({ path, options }) => {
  return fetch(`${PROXIED_URL}/${path}`, {
    ...OPTIONS,
    method: "GET",
    ...options
  }).then(response => response.json());
};

module.exports.post = ({ path, options }) => {
  return fetch(`${PROXIED_URL}/${path}`, {
    ...OPTIONS,
    method: "POST",
    ...options
  }).then(response => response.json());
};
