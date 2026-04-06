export interface Command<TResult> {
  execute(): Promise<TResult>;
}
