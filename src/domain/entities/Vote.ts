export type VoteTargetType = "post" | "comment";

export interface Vote {
  id: string;
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  value: -1 | 1;
  createdAt: number;
}
