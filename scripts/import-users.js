import fs from "fs";
import path from "path";
import pg from "pg";
import { env } from "../src/config/env.js";

const { Client } = pg;
const sqlFilePath = path.resolve("database", "seeds", "precreated_users_import.sql");

async function importUsers() {
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`Import failed: SQL file not found at ${sqlFilePath}`);
    process.exitCode = 1;
    return;
  }

  const sql = fs.readFileSync(sqlFilePath, "utf8").trim();

  if (!sql) {
    console.error("Import failed: SQL file is empty.");
    process.exitCode = 1;
    return;
  }

  const client = new Client({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log("Connected to database");

    await client.query("begin");
    await client.query(sql);
    await client.query("commit");

    console.log("Users import completed successfully");
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // Ignore rollback errors so the original import failure stays visible.
    }

    console.error("Import failed");
    console.error(error.message);
    console.error(error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

await importUsers();
