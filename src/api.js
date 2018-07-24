let URL = "";

if (process.env.NODE_ENV === "production") {
  URL = "https://api.cd.italia.it/api/v1";
} else {
  // Uses `api-proxy.js`
  URL = "http://localhost:3000";
}

const OPTIONS = {
  headers: {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": localStorage.getItem("serviceKey")
  }
};

module.exports.get = ({ path, options }) => {
  return fetch(`${URL}/${path}`, {
    ...OPTIONS,
    ...options,
    method: "GET"
  }).then(response => response.json());
};

module.exports.post = ({ path, options }) => {
  return fetch(`${URL}/${path}`, {
    ...OPTIONS,
    ...options,
    method: "POST",
    body: JSON.stringify(options.body)
  }).then(response => response.json());
};
