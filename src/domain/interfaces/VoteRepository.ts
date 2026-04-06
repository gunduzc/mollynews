import { Vote, VoteTargetType } from "../entities/Vote";

export interface CreateVoteInput {
  id: string;
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  value: -1 | 1;
  createdAt: number;
}

export interface VoteRepository {
  create(input: CreateVoteInput): Promise<Vote>;
  exists(userId: string, targetType: VoteTargetType, targetId: string): Promise<boolean>;
  findByUserTarget(
    userId: string,
    targetType: VoteTargetType,
    targetId: string
  ): Promise<Vote | null>;
  findValuesByUserTargets(
    userId: string,
    targetType: VoteTargetType,
    targetIds: string[]
  ): Promise<Record<string, -1 | 1>>;
  deleteByTarget(targetType: VoteTargetType, targetId: string): Promise<void>;
  deleteByUserTarget(userId: string, targetType: VoteTargetType, targetId: string): Promise<void>;
}
