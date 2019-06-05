import { Component } from "react";

import { GetMessageWorker } from "../workers";

import { getUrl } from "../utils/api";

type Props = {
  dbName: string;
};

class Worker extends Component<Props, never> {
  private working = false;

  public isWorking(): boolean {
    return this.working;
  }

  public componentDidMount() {
    GetMessageWorker.addEventListener("message", ({ data }) => {
      // tslint:disable-next-line:no-object-mutation
      this.working = !data.completed;
    });

    setInterval(() => {
      if (!this.isWorking()) {
        this.start();
      }
    }, 5000);
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
