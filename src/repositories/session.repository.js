import { pool } from "../db/pool.js";

export const sessionRepository = {
  async createSession({
    userId,
    accessToken,
    refreshToken,
    deviceId,
    accessExpiresAt,
    refreshExpiresAt,
    ipAddress = null,
    userAgent = null
  }) {
    const query = `
      insert into sessions (
        user_id,
        device_id,
        access_token,
        refresh_token,
        access_expires_at,
        refresh_expires_at,
        ip_address,
        user_agent
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning
        id,
        user_id,
        device_id,
        access_token,
        refresh_token,
        access_expires_at,
        refresh_expires_at,
        ip_address,
        user_agent,
        is_revoked,
        revoked_at,
        created_at,
        last_used_at
    `;

    const result = await pool.query(query, [
      userId,
      deviceId,
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      ipAddress,
      userAgent
    ]);
    return result.rows[0];
  },

  async findByAccessToken(accessToken) {
    const query = `
      select
        id,
        user_id,
        device_id,
        access_token,
        refresh_token,
        access_expires_at,
        refresh_expires_at,
        ip_address,
        user_agent,
        is_revoked,
        revoked_at,
        created_at,
        last_used_at
      from sessions
      where access_token = $1
      limit 1
    `;

    const result = await pool.query(query, [accessToken]);
    return result.rows[0] ?? null;
  },

  async findByRefreshToken(refreshToken) {
    const query = `
      select
        id,
        user_id,
        device_id,
        access_token,
        refresh_token,
        access_expires_at,
        refresh_expires_at,
        ip_address,
        user_agent,
        is_revoked,
        revoked_at,
        created_at,
        last_used_at
      from sessions
      where refresh_token = $1
      limit 1
    `;

    const result = await pool.query(query, [refreshToken]);
    return result.rows[0] ?? null;
  },

  async updateTokens(sessionId, { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt }) {
    const query = `
      update sessions
      set access_token = $2,
          refresh_token = $3,
          access_expires_at = $4,
          refresh_expires_at = $5,
          last_used_at = now()
      where id = $1
    `;

    await pool.query(query, [sessionId, accessToken, refreshToken, accessExpiresAt, refreshExpiresAt]);
  },

  async revokeSession(sessionId) {
    const query = `
      update sessions
      set is_revoked = true,
          revoked_at = now()
      where id = $1
    `;

    await pool.query(query, [sessionId]);
  }
};
