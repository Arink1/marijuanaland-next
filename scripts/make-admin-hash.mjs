// Usage: node scripts/make-admin-hash.mjs "your-password"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/make-admin-hash.mjs "your-password"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log("\nADMIN_PASSWORD_HASH=" + salt.toString("hex") + ":" + hash.toString("hex"));
console.log("ADMIN_SESSION_SECRET=" + randomBytes(32).toString("hex") + "\n");
