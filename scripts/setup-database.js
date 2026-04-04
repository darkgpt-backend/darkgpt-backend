import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
const schemaPath = path.resolve("database", "schema.sql");
const usersImportPath = path.resolve("database", "seeds", "precreated_users_import.sql");

function readSqlFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} file not found at ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, "utf8").trim();
  if (!sql) {
    throw new Error(`${label} file is empty at ${filePath}`);
  }

  return sql;
}

async function setupDatabase() {
  if (!databaseUrl) {
    console.error("Setup failed");
    console.error("Missing DATABASE_URL in .env");
    process.exitCode = 1;
    return;
  }

  const schemaSql = readSqlFile(schemaPath, "Schema");
  const usersSql = readSqlFile(usersImportPath, "Users import");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    await client.query("begin");

    await client.query(schemaSql);
    console.log("Schema applied");

    await client.query(usersSql);
    console.log("Users imported");

    await client.query("commit");
    console.log("Done");
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // Keep the original error visible if rollback also fails.
    }

    console.error("Setup failed");
    console.error(error.message);
    console.error(error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

await setupDatabase();
