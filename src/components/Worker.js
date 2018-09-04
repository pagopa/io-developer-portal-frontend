import React, { Component } from "react";

import { withDB } from "react-pouchdb/browser";

import { WebWorker } from "../workers/WebWorker";

import { getUrl } from "../utils/api";

class Worker extends Component {
  working = false;

  componentDidMount() {
    WebWorker.addEventListener("message", ({ data }) => {
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

    WebWorker.postMessage({
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
