import { getDb } from "../db/sqlite";
import { Vote, VoteTargetType } from "../../domain/entities/Vote";
import { VoteRepository, CreateVoteInput } from "../../domain/interfaces/VoteRepository";

function mapVote(row: Record<string, unknown>): Vote {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    targetType: row.target_type as VoteTargetType,
    targetId: String(row.target_id),
    value: Number(row.value) as -1 | 1,
    createdAt: Number(row.created_at),
  };
}

export class SqliteVoteRepository implements VoteRepository {
  async create(input: CreateVoteInput): Promise<Vote> {
    const db = await getDb();

    await db.execute({
      sql: `
        INSERT INTO votes (id, user_id, target_type, target_id, value, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        input.id,
        input.userId,
        input.targetType,
        input.targetId,
        input.value,
        input.createdAt,
      ],
    });

    return {
      id: input.id,
      userId: input.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      value: input.value,
      createdAt: input.createdAt,
    };
  }

  async exists(userId: string, targetType: VoteTargetType, targetId: string): Promise<boolean> {
    return (await this.findByUserTarget(userId, targetType, targetId)) !== null;
  }

  async findByUserTarget(
    userId: string,
    targetType: VoteTargetType,
    targetId: string
  ): Promise<Vote | null> {
    const db = await getDb();

    const result = await db.execute({
      sql: `
        SELECT id, user_id, target_type, target_id, value, created_at
        FROM votes
        WHERE user_id = ? AND target_type = ? AND target_id = ?
        LIMIT 1
      `,
      args: [userId, targetType, targetId],
    });

    const row = result.rows[0];
    return row ? mapVote(row as Record<string, unknown>) : null;
  }

  async findValuesByUserTargets(
    userId: string,
    targetType: VoteTargetType,
    targetIds: string[]
  ): Promise<Record<string, -1 | 1>> {
    if (targetIds.length === 0) {
      return {};
    }

    const db = await getDb();
    const placeholders = targetIds.map(() => "?").join(", ");

    const result = await db.execute({
      sql: `
        SELECT target_id, value
        FROM votes
        WHERE user_id = ? AND target_type = ? AND target_id IN (${placeholders})
      `,
      args: [userId, targetType, ...targetIds],
    });

    const values: Record<string, -1 | 1> = {};
    for (const row of result.rows) {
      const record = row as Record<string, unknown>;
      values[String(record.target_id)] = Number(record.value) as -1 | 1;
    }

    return values;
  }

  async deleteByTarget(targetType: VoteTargetType, targetId: string): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        DELETE FROM votes
        WHERE target_type = ? AND target_id = ?
      `,
      args: [targetType, targetId],
    });
  }

  async deleteByUserTarget(
    userId: string,
    targetType: VoteTargetType,
    targetId: string
  ): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        DELETE FROM votes
        WHERE user_id = ? AND target_type = ? AND target_id = ?
      `,
      args: [userId, targetType, targetId],
    });
  }
}
