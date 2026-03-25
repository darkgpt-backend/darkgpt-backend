import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve("database", "seeds", "private_admin_users.csv");

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
  "password_plain",
  "daily_ai_limit",
  "monthly_ai_limit",
  "is_active",
  "limit_enabled"
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
    "password_hash",
    "daily_ai_limit",
    "monthly_ai_limit",
    "is_active",
    "limit_enabled"
  ]
];

for (const row of rows) {
  const [
    accountNumber,
    username,
    passwordPlain,
    dailyAiLimit,
    monthlyAiLimit,
    isActive,
    limitEnabled
  ] = row;

  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  outputRows.push([
    accountNumber,
    username,
    passwordHash,
    dailyAiLimit,
    monthlyAiLimit,
    isActive,
    limitEnabled
  ]);
}

fs.writeFileSync(
  outputPath,
  `${outputRows.map((row) => row.join(",")).join("\n")}\n`,
  "utf8"
);

console.log(`Created hashed CSV: ${outputPath}`);
