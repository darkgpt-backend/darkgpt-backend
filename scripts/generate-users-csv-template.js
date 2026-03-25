import fs from "fs";
import path from "path";
import crypto from "crypto";

const outputPath = path.resolve("database", "seeds", "private_admin_users.csv");

const header = [
  "account_number",
  "username",
  "password_plain",
  "daily_ai_limit",
  "monthly_ai_limit",
  "is_active",
  "limit_enabled"
];

const adjectives = [
  "amber",
  "arc",
  "ashen",
  "binary",
  "cinder",
  "cipher",
  "crimson",
  "dark",
  "ember",
  "frost",
  "ghost",
  "glint",
  "iron",
  "lunar",
  "midnight",
  "neon",
  "night",
  "nova",
  "onyx",
  "phantom",
  "quantum",
  "rapid",
  "shadow",
  "silent",
  "silver",
  "solar",
  "static",
  "storm",
  "velvet",
  "vivid"
];

const nouns = [
  "atlas",
  "beacon",
  "blade",
  "byte",
  "circuit",
  "comet",
  "drift",
  "echo",
  "falcon",
  "flare",
  "forge",
  "frame",
  "haven",
  "helix",
  "matrix",
  "meridian",
  "nexus",
  "orbit",
  "origin",
  "phoenix",
  "pulse",
  "raven",
  "signal",
  "socket",
  "specter",
  "strike",
  "vector",
  "vertex",
  "vision",
  "warden"
];

const passwordCharacters =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=";

function randomItem(list) {
  return list[crypto.randomInt(0, list.length)];
}

function generateUsername(usedUsernames) {
  while (true) {
    const suffix = String(crypto.randomInt(100, 9999)).padStart(4, "0");
    const username = `${randomItem(adjectives)}${randomItem(nouns)}${suffix}`;

    if (!usedUsernames.has(username)) {
      usedUsernames.add(username);
      return username;
    }
  }
}

function generatePassword(length = 18) {
  let password = "";

  for (let index = 0; index < length; index += 1) {
    password += passwordCharacters[crypto.randomInt(0, passwordCharacters.length)];
  }

  return password;
}

const usedUsernames = new Set();
const lines = [header.join(",")];

for (let index = 1; index <= 500; index += 1) {
  lines.push(
    [
      index,
      generateUsername(usedUsernames),
      generatePassword(),
      13000,
      400000,
      true,
      true
    ].join(",")
  );
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Created private admin CSV: ${outputPath}`);
