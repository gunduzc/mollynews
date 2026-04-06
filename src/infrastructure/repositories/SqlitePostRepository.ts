import { getDb } from "../db/sqlite";
import { Post } from "../../domain/entities/Post";
import { PostRepository, CreatePostInput } from "../../domain/interfaces/PostRepository";

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    title: String(row.title),
    type: row.type as "link" | "text",
    url: row.url ? String(row.url) : null,
    text: row.text ? String(row.text) : null,
    authorId: String(row.author_id),
    score: Number(row.score ?? 0),
    status: String(row.status ?? "normal") as "normal" | "hidden" | "removed",
    createdAt: Number(row.created_at),
  };
}

export class SqlitePostRepository implements PostRepository {
  async create(input: CreatePostInput): Promise<Post> {
    const db = await getDb();

    await db.execute({
      sql: `
        INSERT INTO posts (id, title, type, url, text, author_id, score, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        input.id,
        input.title,
        input.type,
        input.url ?? null,
        input.text ?? null,
        input.authorId,
        0,
        "normal",
        input.createdAt,
      ],
    });

    const created = await this.findById(input.id);
    if (!created) {
      throw new Error("Failed to create post");
    }

    return created;
  }

  async findById(id: string): Promise<Post | null> {
    const db = await getDb();

    const result = await db.execute({
      sql: `SELECT * FROM posts WHERE id = ? LIMIT 1`,
      args: [id],
    });

    const row = result.rows[0];
    return row ? mapPost(row as Record<string, unknown>) : null;
  }

  async listLatest(limit: number): Promise<Post[]> {
    const db = await getDb();

    const result = await db.execute({
      sql: `
        SELECT * FROM posts
        ORDER BY created_at DESC
        LIMIT ?
      `,
      args: [limit],
    });

    return result.rows.map((row) => mapPost(row as Record<string, unknown>));
  }

  async listVisible(limit: number): Promise<Post[]> {
    const db = await getDb();

    const result = await db.execute({
      sql: `
        SELECT * FROM posts
        WHERE status = 'normal'
        ORDER BY created_at DESC
        LIMIT ?
      `,
      args: [limit],
    });

    return result.rows.map((row) => mapPost(row as Record<string, unknown>));
  }

  async incrementScore(id: string): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        UPDATE posts
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
        UPDATE posts
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
        DELETE FROM posts
        WHERE id = ?
      `,
      args: [id],
    });
  }

  async updateStatus(id: string, status: "normal" | "hidden" | "removed"): Promise<void> {
    const db = await getDb();

    await db.execute({
      sql: `
        UPDATE posts
        SET status = ?
        WHERE id = ?
      `,
      args: [status, id],
    });
  }
}
