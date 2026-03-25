import fs from "fs";
import path from "path";

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve("database", "seeds", "precreated_users_hashed.csv");

const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve("database", "seeds", "precreated_users_import.sql");

function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((item) => item.trim()));
}

function escapeSql(value) {
  return value.replace(/'/g, "''");
}

const expectedHeader = [
  "account_number",
  "username",
  "password_hash",
  "daily_ai_limit",
  "monthly_ai_limit",
  "is_active",
  "limit_enabled"
];

const content = fs.readFileSync(inputPath, "utf8");
const [header, ...rows] = parseCsv(content);

if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
  console.error("CSV header is not valid for SQL generation.");
  process.exit(1);
}

const valuesSql = rows
  .map((row) => {
    const [
      accountNumber,
      username,
      passwordHash,
      dailyAiLimit,
      monthlyAiLimit,
      isActive,
      limitEnabled
    ] = row;

    return `  (${accountNumber}, '${escapeSql(username)}', '${escapeSql(passwordHash)}', ${dailyAiLimit}, ${monthlyAiLimit}, ${isActive}, ${limitEnabled})`;
  })
  .join(",\n");

const sql = `-- Generated DarkGPT pre-created user import
with prepared_users (
  account_number,
  username,
  password_hash,
  daily_ai_limit,
  monthly_ai_limit,
  is_active,
  limit_enabled
) as (
  values
${valuesSql}
)
insert into users (
  account_number,
  username,
  password_hash,
  daily_ai_limit,
  monthly_ai_limit,
  is_active,
  limit_enabled,
  is_precreated
)
select
  account_number,
  username,
  password_hash,
  daily_ai_limit,
  monthly_ai_limit,
  is_active,
  limit_enabled,
  true
from prepared_users
on conflict (account_number) do nothing;
`;

fs.writeFileSync(outputPath, sql, "utf8");
console.log(`Created SQL import file: ${outputPath}`);
