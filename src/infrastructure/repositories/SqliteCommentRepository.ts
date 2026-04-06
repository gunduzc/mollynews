import { getDb } from "../db/sqlite";
import { Comment } from "../../domain/entities/Comment";
import {
  CommentRepository,
  CreateCommentInput,
} from "../../domain/interfaces/CommentRepository";

function mapComment(row: Record<string, unknown>): Comment {
  return {
    id: String(row.id),
    postId: String(row.post_id),
    authorId: String(row.author_id),
    parentCommentId: row.parent_comment_id ? String(row.parent_comment_id) : null,
    content: String(row.content),
    score: Number(row.score ?? 0),
    status: String(row.status ?? "normal") as "normal" | "hidden" | "removed",
    createdAt: Number(row.created_at),
  };
}

export class SqliteCommentRepository implements CommentRepository {
  async create(input: CreateCommentInput): Promise<Comment> {
    const db = await getDb();

    await db.execute({
      sql: `
        INSERT INTO comments (
          id, post_id, author_id, parent_comment_id, content, score, status, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        input.id,
        input.postId,
        input.authorId,
        input.parentCommentId ?? null,
        input.content,
        0,
        "normal",
        input.createdAt,
      ],
    });

    const created = await this.findById(input.id);
    if (!created) {
      throw new Error("Failed to create comment");
    }

    return created;
  }

  async findById(id: string): Promise<Comment | null> {
    const db = await getDb();

    const result = await db.execute({
      sql: `SELECT * FROM comments WHERE id = ? LIMIT 1`,
      args: [id],
    });

    const row = result.rows[0];
    return row ? mapComment(row as Record<string, unknown>) : null;
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    const db = await getDb();

    const result = await db.execute({
      sql: `
        SELECT * FROM comments
        WHERE post_id = ?
        ORDER BY created_at ASC
      `,
      args: [postId],
    });

    return result.rows.map((row) => mapComment(row as Record<string, unknown>));
  }

  async findSubtreeIds(id: string): Promise<string[]> {
    const db = await getDb();

    const result = await db.execute({
      sql: `
        WITH RECURSIVE comment_tree(id) AS (
          SELECT id FROM comments WHERE id = ?
          UNION ALL
          SELECT c.id
          FROM comments c
          INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
        )
        SELECT id FROM comment_tree
      `,
      args: [id],
    });

    return result.rows.map((row) => String((row as Record<string, unknown>).id));
  }

  async incrementScore(id: string): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        UPDATE comments
        SET score = score + 1
        WHERE id = ?
      `,
      args: [id],
    });
  }

  async decrementScore(id: string): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        UPDATE comments
        SET score = score - 1
        WHERE id = ?
      `,
      args: [id],
    });
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        WITH RECURSIVE comment_tree(id) AS (
          SELECT id FROM comments WHERE id = ?
          UNION ALL
          SELECT c.id
          FROM comments c
          INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
        )
        DELETE FROM comments
        WHERE id IN (SELECT id FROM comment_tree)
      `,
      args: [id],
    });
  }

  async deleteByPostId(postId: string): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        DELETE FROM comments
        WHERE post_id = ?
      `,
      args: [postId],
    });
  }

  async updateStatus(id: string, status: "normal" | "hidden" | "removed"): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        UPDATE comments
        SET status = ?
        WHERE id = ?
      `,
      args: [status, id],
    });
  }
}
