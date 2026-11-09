import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('outfit-matcher.db');
    await initSchema(db);
  }
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS clothing_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_uri TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('top', 'bottom', 'shoes')),
      label TEXT,
      color TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      top_id INTEGER,
      bottom_id INTEGER,
      shoes_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (top_id) REFERENCES clothing_items(id) ON DELETE SET NULL,
      FOREIGN KEY (bottom_id) REFERENCES clothing_items(id) ON DELETE SET NULL,
      FOREIGN KEY (shoes_id) REFERENCES clothing_items(id) ON DELETE SET NULL
    );
  `);
}
