import express, { Request, Response } from "express";
import { ICustomWindow } from "./src/customTypes/CustomWindow";
const request = require("request");
const cors = require("cors");

const customWindow = window as ICustomWindow;
const APIM_BASE_URL = customWindow._env_.IO_DEVELOPER_PORTAL_APIM_BASE_URL;

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

app.listen(customWindow._env_.IO_DEVELOPER_PORTAL_PORT || 3000);
