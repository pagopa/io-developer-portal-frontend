import { Component } from "react";

import { GetMessageWorker } from "../workers";

import { getUrl } from "../utils/api";

type WorkerProps = {
  dbName: string;
};

class Worker extends Component<WorkerProps, never> {
  public working = false;

  public componentDidMount() {
    GetMessageWorker.addEventListener("message", ({ data }) => {
      this.working = !data.completed;
    });

    setInterval(() => {
      if (!this.working) {
        this.start();
      }
    }, 5 * 1000);
  }

  public start = () => {
    this.working = true;

    const { dbName } = this.props;

    GetMessageWorker.postMessage({
      action: "getMessage",
      dbName,
      url: getUrl()
    });
  };

  public render() {
    return null;
  }
}

export default Worker;
