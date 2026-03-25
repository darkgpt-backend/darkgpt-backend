import { pool } from "../db/pool.js";

export const sessionRepository = {
  async createSession({ userId, accessToken, refreshToken, deviceId, deviceName }) {
    const query = `
      insert into sessions (user_id, access_token, refresh_token, device_id, device_name)
      values ($1, $2, $3, $4, $5)
      returning id, user_id, access_token, refresh_token, device_id, device_name, is_revoked, created_at
    `;

    const result = await pool.query(query, [userId, accessToken, refreshToken, deviceId, deviceName]);
    return result.rows[0];
  },

  async findByAccessToken(accessToken) {
    const query = `
      select id, user_id, access_token, refresh_token, device_id, device_name, is_revoked, created_at
      from sessions
      where access_token = $1
      limit 1
    `;

    const result = await pool.query(query, [accessToken]);
    return result.rows[0] ?? null;
  },

  async findByRefreshToken(refreshToken) {
    const query = `
      select id, user_id, access_token, refresh_token, device_id, device_name, is_revoked, created_at
      from sessions
      where refresh_token = $1
      limit 1
    `;

    const result = await pool.query(query, [refreshToken]);
    return result.rows[0] ?? null;
  },

  async updateTokens(sessionId, { accessToken, refreshToken }) {
    const query = `
      update sessions
      set access_token = $2,
          refresh_token = $3
      where id = $1
    `;

    await pool.query(query, [sessionId, accessToken, refreshToken]);
  },

  async revokeSession(sessionId) {
    const query = `
      update sessions
      set is_revoked = true
      where id = $1
    `;

    await pool.query(query, [sessionId]);
  }
};

