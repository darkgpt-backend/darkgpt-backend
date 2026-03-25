import fs from "fs";
import path from "path";

const outputPath = path.resolve("database", "seeds", "precreated_users_template.csv");

const header = [
  "account_number",
  "username",
  "email",
  "password_plain",
  "daily_limit",
  "monthly_limit",
  "account_status"
];

const lines = [header.join(",")];

for (let index = 1; index <= 500; index += 1) {
  const padded = String(index).padStart(3, "0");
  lines.push(
    [
      index,
      `darkgpt_user_${padded}`,
      `user${padded}@example.com`,
      `REPLACE_PASSWORD_${padded}`,
      25,
      250,
      "active"
    ].join(",")
  );
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Created CSV template: ${outputPath}`);

