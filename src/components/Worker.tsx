import React, { Component } from "react";

import { withDB } from "react-pouchdb/browser";

import { GetMessageWorker } from "../workers";

import { getUrl } from "../utils/api";

type WorkerProps = {
  dbName: string;
};

class Worker extends Component<WorkerProps, never> {
  working = false;

  componentDidMount() {
    GetMessageWorker.addEventListener("message", ({ data }) => {
      this.working = !data.completed;
    });

    setInterval(() => {
      if (!this.working) {
        this.start();
      }
    }, 5 * 1000);
  }

  start = () => {
    this.working = true;

    const { dbName } = this.props;

    GetMessageWorker.postMessage({
      action: "getMessage",
      dbName,
      url: getUrl()
    });
  };

  render() {
    return null;
  }
}

export default Worker;
