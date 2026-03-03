import { Session } from "../../domain/entities/Session";
import { SessionRepository } from "../../domain/interfaces/SessionRepository";
import { getDb } from "../db/sqlite";

export class SqliteSessionRepository implements SessionRepository {
  async create(session: Session): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO sessions (token, user_id, expires_at)
            VALUES (?, ?, ?)`,
      args: [session.token, session.userId, session.expiresAt]
    });
  }

  async findByToken(token: string): Promise<Session | null> {
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT token, user_id as userId, expires_at as expiresAt
            FROM sessions
            WHERE token = ?`,
      args: [token]
    });

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      token: String(row.token),
      userId: String(row.userId),
      expiresAt: Number(row.expiresAt)
    };
  }

  async delete(token: string): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: `DELETE FROM sessions WHERE token = ?`,
      args: [token]
    });
  }
}
