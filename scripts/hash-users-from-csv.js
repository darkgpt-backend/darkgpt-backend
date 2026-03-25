import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve("database", "seeds", "precreated_users_template.csv");

const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve("database", "seeds", "precreated_users_hashed.csv");

function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((item) => item.trim()));
}

const expectedHeader = [
  "account_number",
  "username",
  "email",
  "password_plain",
  "daily_limit",
  "monthly_limit",
  "account_status"
];

const content = fs.readFileSync(inputPath, "utf8");
const [header, ...rows] = parseCsv(content);

if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
  console.error("CSV header is not valid for bulk hashing.");
  process.exit(1);
}

const outputRows = [
  [
    "account_number",
    "username",
    "email",
    "password_hash",
    "daily_limit",
    "monthly_limit",
    "account_status"
  ]
];

for (const row of rows) {
  const [
    accountNumber,
    username,
    email,
    passwordPlain,
    dailyLimit,
    monthlyLimit,
    accountStatus
  ] = row;

  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  outputRows.push([
    accountNumber,
    username,
    email,
    passwordHash,
    dailyLimit,
    monthlyLimit,
    accountStatus
  ]);
}

fs.writeFileSync(
  outputPath,
  `${outputRows.map((row) => row.join(",")).join("\n")}\n`,
  "utf8"
);

console.log(`Created hashed CSV: ${outputPath}`);

