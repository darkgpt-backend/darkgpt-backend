import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

// This pool is the main PostgreSQL connection point for the backend.
// Render will inject DATABASE_URL after deployment.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false
});

