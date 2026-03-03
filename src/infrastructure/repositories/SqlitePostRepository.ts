import { Post } from "../../domain/entities/Post";
import { PostRepository } from "../../domain/interfaces/PostRepository";
import { getDb } from "../db/sqlite";

export class SqlitePostRepository implements PostRepository {
  async create(post: Post): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO posts (id, title, type, url, text, author_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        post.id,
        post.title,
        post.type,
        post.url ?? null,
        post.text ?? null,
        post.authorId,
        post.createdAt
      ]
    });
  }

  async listLatest(limit: number): Promise<Post[]> {
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT id, title, type, url, text, author_id as authorId, created_at as createdAt
            FROM posts
            ORDER BY created_at DESC
            LIMIT ?`,
      args: [limit]
    });

    return result.rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      type: row.type as Post["type"],
      url: row.url ? String(row.url) : undefined,
      text: row.text ? String(row.text) : undefined,
      authorId: String(row.authorId),
      createdAt: Number(row.createdAt)
    }));
  }
}
