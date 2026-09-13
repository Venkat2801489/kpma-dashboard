// Generates a random username/password pair and its bcrypt hash for one of
// the two dashboard logins. The plaintext password is only ever printed to
// the terminal — it is never written to a file or committed anywhere.
//
// Usage: node scripts/generate-credentials.mjs [label]
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const label = process.argv[2] ?? "dashboard";

function randomWord(length) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[crypto.randomInt(alphabet.length)];
  }
  return out;
}

const username = "admin";
const password = `${randomWord(4)}-${randomWord(4)}-${randomWord(4)}`;
const hash = bcrypt.hashSync(password, 12);

// Next.js expands `$VAR` references when it loads .env files, which would
// mangle a raw bcrypt hash (it's full of `$`). Escaping each `$` as `\$`
// makes Next.js treat it as a literal character instead.
const escapedHash = hash.replace(/\$/g, "\\$");

console.log(`\n${label} credentials`);
console.log("-".repeat(label.length + 12));
console.log(`username: ${username}`);
console.log(`password: ${password}`);
console.log(`\nPaste this line into your .env exactly as-is (the backslashes are required):`);
console.log(`${label.toUpperCase()}_AUTH_PASS_HASH="${escapedHash}"`);
console.log();
