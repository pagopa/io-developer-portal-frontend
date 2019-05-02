import { Component } from "react";

import { GetMessageWorker } from "../workers";

import { getUrl } from "../utils/api";

type Props = {
  dbName: string;
};

class Worker extends Component<Props, never> {
  public working = false;

  public componentDidMount() {
    GetMessageWorker.addEventListener("message", ({ data }) => {
      // tslint:disable-next-line:no-object-mutation
      this.working = !data.completed;
    });

    setInterval(() => {
      if (!this.working) {
        this.start();
      }
    }, 5 * 1000);
  }

  public start = () => {
    // tslint:disable-next-line:no-object-mutation
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
