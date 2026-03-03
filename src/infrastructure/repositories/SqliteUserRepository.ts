import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/interfaces/UserRepository";
import { getDb } from "../db/sqlite";

export class SqliteUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO users (id, username, password_hash, password_salt, created_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [user.id, user.username, user.passwordHash, user.passwordSalt, user.createdAt]
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT id, username, password_hash as passwordHash, password_salt as passwordSalt, created_at as createdAt
            FROM users
            WHERE username = ?`,
      args: [username]
    });

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      username: String(row.username),
      passwordHash: String(row.passwordHash),
      passwordSalt: String(row.passwordSalt),
      createdAt: Number(row.createdAt)
    };
  }

  async findById(id: string): Promise<User | null> {
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT id, username, password_hash as passwordHash, password_salt as passwordSalt, created_at as createdAt
            FROM users
            WHERE id = ?`,
      args: [id]
    });

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      username: String(row.username),
      passwordHash: String(row.passwordHash),
      passwordSalt: String(row.passwordSalt),
      createdAt: Number(row.createdAt)
    };
  }
}
