import fs from "fs";
import path from "path";
import { createClient, type Client } from "@libsql/client";

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "app.db");
const dbUrl = process.env.SQLITE_URL ?? `file:${dbPath}`;

let clientPromise: Promise<Client> | null = null;

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
      type TEXT NOT NULL,
      url TEXT,
      text TEXT,
      author_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users (id)
    );
  `);

  return client;
}

export function getDb(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = initDb();
  }
  return clientPromise;
}
