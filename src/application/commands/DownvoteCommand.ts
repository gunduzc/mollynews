import { randomUUID } from "crypto";
import { Command } from "./Command";
import { Vote, VoteTargetType } from "../../domain/entities/Vote";
import { VoteRepository } from "../../domain/interfaces/VoteRepository";

type VoteReadable = {
  id: string;
  status: "normal" | "hidden" | "removed";
};

type VoteTargetRepository = {
  findById(id: string): Promise<VoteReadable | null>;
  incrementScore(id: string): Promise<void>;
  decrementScore(id: string): Promise<void>;
};

export type DownvoteCommandResult<TTarget extends VoteReadable> = {
  message: string;
  target: TTarget | null;
};

type DownvoteCommandInput = {
  userId: string;
  targetId: string;
  targetType: VoteTargetType;
  targetLabel: string;
};

export class DownvoteCommand<TTarget extends VoteReadable>
  implements Command<DownvoteCommandResult<TTarget>>
{
  constructor(
    private readonly input: DownvoteCommandInput,
    private readonly targetRepository: VoteTargetRepository,
    private readonly voteRepository: VoteRepository
  ) {}

  async execute(): Promise<DownvoteCommandResult<TTarget>> {
    const target = await this.targetRepository.findById(this.input.targetId);
    if (!target) {
      throw new Error(`${this.input.targetLabel} not found`);
    }

    const existingVote = await this.voteRepository.findByUserTarget(
      this.input.userId,
      this.input.targetType,
      this.input.targetId
    );

    let message = `${this.input.targetLabel} downvoted successfully`;

    if (!existingVote) {
      await this.createVote(-1);
      await this.targetRepository.decrementScore(this.input.targetId);
    } else if (existingVote.value === -1) {
      await this.voteRepository.deleteByUserTarget(
        this.input.userId,
        this.input.targetType,
        this.input.targetId
      );
      await this.targetRepository.incrementScore(this.input.targetId);
      message = `${this.input.targetLabel} downvote removed`;
    } else {
      await this.voteRepository.deleteByUserTarget(
        this.input.userId,
        this.input.targetType,
        this.input.targetId
      );
      await this.createVote(-1);
      await this.targetRepository.decrementScore(this.input.targetId);
      await this.targetRepository.decrementScore(this.input.targetId);
      message = `Upvote removed and ${this.input.targetLabel.toLowerCase()} downvoted`;
    }

    return {
      message,
      target: (await this.targetRepository.findById(this.input.targetId)) as TTarget | null,
    };
  }

  private async createVote(value: Vote["value"]) {
    await this.voteRepository.create({
      id: randomUUID(),
      userId: this.input.userId,
      targetType: this.input.targetType,
      targetId: this.input.targetId,
      value,
      createdAt: Date.now(),
    });
  }
}
