// One-off admin CLI to reset a user's password directly in the DB.
// Usage: npx tsx server/scripts/reset-password.ts <username> <newPassword>
import bcrypt from "bcrypt";
import { db } from "../src/db.js";

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error("Usage: npx tsx server/scripts/reset-password.ts <username> <newPassword>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("password must be at least 8 characters");
  process.exit(1);
}

const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as
  | { id: number }
  | undefined;
if (!user) {
  console.error(`no user found with username "${username}"`);
  process.exit(1);
}

const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);

console.log(`password reset for "${username}"`);
