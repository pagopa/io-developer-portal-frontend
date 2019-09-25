import express, { Request, Response } from "express";
const request = require("request");
const cors = require("cors");

const APIM_BASE_URL = window._env_.IO_DEVELOPER_PORTAL_APIM_BASE_URL;

const app = express();
app.use(cors());

app.use("/", (req: Request, res: Response) => {
  const url = `${APIM_BASE_URL}${req.url}`;
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

app.listen(window._env_.IO_DEVELOPER_PORTAL_PORT || 3000);
