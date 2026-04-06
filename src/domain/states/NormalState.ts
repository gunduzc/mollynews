import { ContentState } from "./ContentState";
import { HiddenState } from "./HiddenState";
import { RemovedState } from "./RemovedState";

export class NormalState implements ContentState {
  hide(): ContentState {
    return new HiddenState();
  }

  remove(): ContentState {
    return new RemovedState();
  }

  restore(): ContentState {
    return this;
  }

  getStatus(): "normal" {
    return "normal";
  }
}