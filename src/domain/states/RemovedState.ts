import { ContentState } from "./ContentState";
import { NormalState } from "./NormalState";

export class RemovedState implements ContentState {
  hide(): ContentState {
    return this;
  }

  remove(): ContentState {
    return this;
  }

  restore(): ContentState {
    return new NormalState();
  }

  getStatus(): "removed" {
    return "removed";
  }
}