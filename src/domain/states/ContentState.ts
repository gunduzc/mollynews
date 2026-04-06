export type ContentStatus = "normal" | "hidden" | "removed";

export interface ContentState {
  hide(): ContentState;
  remove(): ContentState;
  restore(): ContentState;
  getStatus(): ContentStatus;
}