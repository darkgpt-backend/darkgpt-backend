import { pool } from "../db/pool.js";

export const healthService = {
  async getStatus() {
    const dbResult = await pool.query("select now() as server_time");

    return {
      service: "darkgpt-backend",
      status: "ok",
      database: "connected",
      serverTime: dbResult.rows[0].server_time
    };
  }
};

