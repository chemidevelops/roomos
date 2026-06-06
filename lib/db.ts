import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

function getDbPath(): string {
  const prod = "/var/data";
  if (fs.existsSync(prod)) {
    return path.join(prod, "roomos.db");
  }
  return "/tmp/roomos.db";
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = getDbPath();
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL DEFAULT '',
      content    TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS backlog_items (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      category   TEXT NOT NULL,
      color      TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedule_entries (
      id        TEXT PRIMARY KEY,
      item_id   TEXT NOT NULL,
      date      TEXT NOT NULL,
      start_min INTEGER NOT NULL,
      end_min   INTEGER NOT NULL,
      notes     TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS usage_events (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL,  -- 'radio' | 'podcast' | 'tv'
      label      TEXT NOT NULL,  -- station name / podcast title / video title
      seconds    INTEGER NOT NULL DEFAULT 0,
      date       TEXT NOT NULL,  -- YYYY-MM-DD
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id        TEXT PRIMARY KEY,
      title     TEXT NOT NULL,
      date      TEXT NOT NULL,
      time      TEXT NOT NULL DEFAULT '',
      notes     TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
  `);

  return _db;
}
