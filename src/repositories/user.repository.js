import { pool } from "../db/pool.js";

const userSelect = `
  select
    id,
    account_number,
    username,
    email,
    password_hash,
    is_precreated,
    is_active,
    device_id,
    device_name,
    device_bound_at,
    daily_ai_limit,
    monthly_ai_limit,
    daily_ai_used,
    monthly_ai_used,
    limit_enabled,
    daily_usage_reset_at,
    monthly_usage_reset_at,
    last_login_at,
    created_at,
    updated_at
  from users
`;

export const userRepository = {
  async createUser({
    accountNumber,
    username,
    email = null,
    passwordHash,
    dailyAiLimit = 13000,
    monthlyAiLimit = 400000,
    isActive = true,
    limitEnabled = true
  }) {
    const result = await pool.query(
      `
        insert into users (
          account_number,
          username,
          email,
          password_hash,
          is_active,
          daily_ai_limit,
          monthly_ai_limit,
          limit_enabled
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning *
      `,
      [accountNumber, username, email, passwordHash, isActive, dailyAiLimit, monthlyAiLimit, limitEnabled]
    );

    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query(
      `
        ${userSelect}
        where username = $1
        limit 1
      `,
      [username]
    );

    return result.rows[0] ?? null;
  },

  async findById(id) {
    const result = await pool.query(
      `
        ${userSelect}
        where id = $1
        limit 1
      `,
      [id]
    );

    return result.rows[0] ?? null;
  },

  async bindDevice({ userId, deviceId, deviceName }) {
    const result = await pool.query(
      `
        update users
        set device_id = $2,
            device_name = $3,
            device_bound_at = now(),
            last_login_at = now()
        where id = $1
        returning *
      `,
      [userId, deviceId, deviceName]
    );

    return result.rows[0] ?? null;
  },

  async clearBoundDevice(userId) {
    const result = await pool.query(
      `
        update users
        set device_id = null,
            device_name = null,
            device_bound_at = null
        where id = $1
        returning *
      `,
      [userId]
    );

    return result.rows[0] ?? null;
  },

  async touchLastLogin(userId) {
    await pool.query(
      `
        update users
        set last_login_at = now()
        where id = $1
      `,
      [userId]
    );
  },

  async updateLimits(userId, { limitEnabled, dailyAiLimit, monthlyAiLimit }) {
    const result = await pool.query(
      `
        update users
        set limit_enabled = coalesce($2, limit_enabled),
            daily_ai_limit = coalesce($3, daily_ai_limit),
            monthly_ai_limit = coalesce($4, monthly_ai_limit)
        where id = $1
        returning *
      `,
      [userId, limitEnabled, dailyAiLimit, monthlyAiLimit]
    );

    return result.rows[0] ?? null;
  },

  async setActiveState(userId, isActive) {
    const result = await pool.query(
      `
        update users
        set is_active = $2
        where id = $1
        returning *
      `,
      [userId, isActive]
    );

    return result.rows[0] ?? null;
  },

  async replaceUsageSnapshot(userId, { dailyAiUsed, monthlyAiUsed, dailyResetAt, monthlyResetAt }) {
    const result = await pool.query(
      `
        update users
        set daily_ai_used = $2,
            monthly_ai_used = $3,
            daily_usage_reset_at = $4,
            monthly_usage_reset_at = $5
        where id = $1
        returning *
      `,
      [userId, dailyAiUsed, monthlyAiUsed, dailyResetAt, monthlyResetAt]
    );

    return result.rows[0] ?? null;
  },

  async addUsage(userId, tokensUsed) {
    const result = await pool.query(
      `
        update users
        set daily_ai_used = daily_ai_used + $2,
            monthly_ai_used = monthly_ai_used + $2
        where id = $1
        returning *
      `,
      [userId, tokensUsed]
    );

    return result.rows[0] ?? null;
  },

  toPublicUser(user) {
    return {
      id: user.id,
      accountNumber: user.account_number,
      username: user.username,
      isActive: user.is_active,
      deviceBound: Boolean(user.device_id),
      limitEnabled: user.limit_enabled,
      dailyAiLimit: user.daily_ai_limit,
      monthlyAiLimit: user.monthly_ai_limit,
      dailyAiUsed: user.daily_ai_used,
      monthlyAiUsed: user.monthly_ai_used,
      createdAt: user.created_at
    };
  }
};
