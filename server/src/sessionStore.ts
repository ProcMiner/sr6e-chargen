import { Store, type SessionData } from "express-session";
import { db } from "./db.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
`);

const getStmt = db.prepare("SELECT sess, expires FROM sessions WHERE sid = ?");
const setStmt = db.prepare(
  "INSERT INTO sessions (sid, sess, expires) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires"
);
const destroyStmt = db.prepare("DELETE FROM sessions WHERE sid = ?");
const touchStmt = db.prepare("UPDATE sessions SET expires = ? WHERE sid = ?");
const pruneStmt = db.prepare("DELETE FROM sessions WHERE expires < ?");

/** Minimal express-session Store backed by the app's own better-sqlite3 db. */
export class SqliteSessionStore extends Store {
  constructor() {
    super();
    pruneStmt.run(Date.now());
  }

  get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void
  ): void {
    try {
      const row = getStmt.get(sid) as { sess: string; expires: number } | undefined;
      if (!row || row.expires < Date.now()) return callback(null, null);
      callback(null, JSON.parse(row.sess));
    } catch (err) {
      callback(err);
    }
  }

  set(sid: string, session: SessionData, callback?: (err?: unknown) => void): void {
    try {
      const expires = session.cookie?.expires
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + 1000 * 60 * 60 * 24 * 30;
      setStmt.run(sid, JSON.stringify(session), expires);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    try {
      destroyStmt.run(sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  touch(sid: string, session: SessionData, callback?: (err?: unknown) => void): void {
    try {
      const expires = session.cookie?.expires
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + 1000 * 60 * 60 * 24 * 30;
      touchStmt.run(expires, sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}
