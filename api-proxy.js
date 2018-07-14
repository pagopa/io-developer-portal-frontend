const express = require("express");
const request = require("request");
const cors = require("cors");

const BASE_URL = "https://api.cd.italia.it/api/v1";

const app = express();
app.use(cors());

app.use("/", function(req, res) {
  const url = `${BASE_URL}${req.url}`;
  console.info("Proxied", req.method, req.url, "to", url);
  req
    .pipe(
      request({
        method: req.method,
        url
      })
    )
    .pipe(res);
});

app.listen(process.env.PORT || 3000);
