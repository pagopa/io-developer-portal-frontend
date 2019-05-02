declare module "batch" {
  type ProgressEvent = {
    index: number;
    value: any;
    error: any;
    pending: number;
    total: number;
    complete: number;
    percent: number;
    start: Date;
    end: Date;
    duration: number;
  };

  type CallbackFunction = (error?: any, result?: any) => void;

  export default class Batch {
    constructor(...args: any);
    public concurrency(n: number): never;
    public on(
      event: "progress",
      eventHandler: (e: ProgressEvent) => void
    ): void;
    public push(fn: (done: CallbackFunction) => void): void;
    public end(cb: CallbackFunction): void;
  }
}
