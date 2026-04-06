import { ContentState } from "./ContentState";
import { NormalState } from "./NormalState";
import { RemovedState } from "./RemovedState";

export class HiddenState implements ContentState {
  hide(): ContentState {
    return this;
  }

  remove(): ContentState {
    return new RemovedState();
  }

  restore(): ContentState {
    return new NormalState();
  }

  getStatus(): "hidden" {
    return "hidden";
  }
}