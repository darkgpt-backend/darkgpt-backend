import { pool } from "../db/pool.js";

export const userRepository = {
  async createUser({ accountNumber, username, email, passwordHash, dailyAiLimit = 25, monthlyAiLimit = 250 }) {
    const query = `
      insert into users (
        account_number,
        username,
        email,
        password_hash,
        daily_ai_limit,
        monthly_ai_limit
      )
      values ($1, $2, $3, $4, $5, $6)
      returning
        id,
        account_number,
        username,
        email,
        password_hash,
        status,
        is_precreated,
        device_binding_required,
        bound_device_id,
        bound_device_name,
        device_bound_at,
        daily_ai_limit,
        monthly_ai_limit,
        last_login_at,
        created_at,
        updated_at
    `;

    const result = await pool.query(query, [
      accountNumber,
      username,
      email,
      passwordHash,
      dailyAiLimit,
      monthlyAiLimit
    ]);
    return result.rows[0];
  },

  async findByUsernameOrEmail(value) {
    const query = `
      select
        id,
        account_number,
        username,
        email,
        password_hash,
        status,
        is_precreated,
        device_binding_required,
        bound_device_id,
        bound_device_name,
        device_bound_at,
        daily_ai_limit,
        monthly_ai_limit,
        last_login_at,
        created_at,
        updated_at
      from users
      where username = $1 or email = $1
      limit 1
    `;

    const result = await pool.query(query, [value]);
    return result.rows[0] ?? null;
  },

  async findById(id) {
    const query = `
      select
        id,
        account_number,
        username,
        email,
        password_hash,
        status,
        is_precreated,
        device_binding_required,
        bound_device_id,
        bound_device_name,
        device_bound_at,
        daily_ai_limit,
        monthly_ai_limit,
        last_login_at,
        created_at,
        updated_at
      from users
      where id = $1
      limit 1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  },

  async bindDevice({ userId, deviceId, deviceName }) {
    const query = `
      update users
      set bound_device_id = $2,
          bound_device_name = $3,
          device_bound_at = now(),
          last_login_at = now()
      where id = $1
      returning
        id,
        account_number,
        username,
        email,
        password_hash,
        status,
        is_precreated,
        device_binding_required,
        bound_device_id,
        bound_device_name,
        device_bound_at,
        daily_ai_limit,
        monthly_ai_limit,
        last_login_at,
        created_at,
        updated_at
    `;

    const result = await pool.query(query, [userId, deviceId, deviceName]);
    return result.rows[0];
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

  toPublicUser(user) {
    return {
      id: user.id,
      accountNumber: user.account_number,
      username: user.username,
      email: user.email,
      status: user.status,
      deviceBound: Boolean(user.bound_device_id),
      dailyAiLimit: user.daily_ai_limit,
      monthlyAiLimit: user.monthly_ai_limit,
      createdAt: user.created_at
    };
  }
};

