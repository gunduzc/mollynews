import fs from "fs";
import path from "path";
import { createClient, type Client } from "@libsql/client";

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "app.db");
const dbUrl = process.env.SQLITE_URL ?? `file:${dbPath}`;

let clientPromise: Promise<Client> | null = null;

async function ensureVoteSchema(client: Client) {
  const schemaResult = await client.execute({
    sql: `
      SELECT sql
      FROM sqlite_master
      WHERE type = 'table' AND name = 'votes'
      LIMIT 1
    `,
    args: [],
  });

  const schemaRow = schemaResult.rows[0] as Record<string, unknown> | undefined;
  const schemaSql = String(schemaRow?.sql ?? "");

  if (schemaSql.includes("value IN (-1, 1)")) {
    return;
  }

  await client.execute(`ALTER TABLE votes RENAME TO votes_legacy;`);

  await client.execute(`
    CREATE TABLE votes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
      target_id TEXT NOT NULL,
      value INTEGER NOT NULL CHECK(value IN (-1, 1)),
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, target_type, target_id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  await client.execute(`
    INSERT INTO votes (id, user_id, target_type, target_id, value, created_at)
    SELECT id, user_id, target_type, target_id, value, created_at
    FROM votes_legacy;
  `);

  await client.execute(`DROP TABLE votes_legacy;`);
}

async function initDb(): Promise<Client> {
  if (dbUrl.startsWith("file:")) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const client = createClient({ url: dbUrl });

  await client.execute(`PRAGMA journal_mode = WAL;`);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('link', 'text')),
      url TEXT,
      text TEXT,
      author_id TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'normal',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users (id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      parent_comment_id TEXT,
      content TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'normal',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts (id),
      FOREIGN KEY (author_id) REFERENCES users (id),
      FOREIGN KEY (parent_comment_id) REFERENCES comments (id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
      target_id TEXT NOT NULL,
      value INTEGER NOT NULL CHECK(value IN (-1, 1)),
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, target_type, target_id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  await ensureVoteSchema(client);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posts_created_at
    ON posts(created_at DESC);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posts_score
    ON posts(score DESC);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posts_status
    ON posts(status);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_comments_post_id
    ON comments(post_id);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id
    ON comments(parent_comment_id);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_comments_created_at
    ON comments(created_at DESC);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_comments_status
    ON comments(status);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_votes_target
    ON votes(target_type, target_id);
  `);

  return client;
}

export function getDb(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = initDb();
  }
  return clientPromise;
}
