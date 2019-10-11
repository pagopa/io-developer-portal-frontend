import express, { Request, Response } from "express";
import { getConfig } from "./src/utils/config";
const request = require("request");
const cors = require("cors");

const app = express();
app.use(cors());

app.use("/", (req: Request, res: Response) => {
  const url = `${getConfig("IO_DEVELOPER_PORTAL_APIM_BASE_URL")}${req.url}`;
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

app.listen(getConfig("IO_DEVELOPER_PORTAL_PORT") || 3000);
