import { pool } from "../db/pool.js";

export const userRepository = {
  async createUser({ username, email, passwordHash }) {
    const query = `
      insert into users (username, email, password_hash)
      values ($1, $2, $3)
      returning id, username, email, password_hash, created_at
    `;

    const result = await pool.query(query, [username, email, passwordHash]);
    return result.rows[0];
  },

  async findByUsernameOrEmail(value) {
    const query = `
      select id, username, email, password_hash, created_at
      from users
      where username = $1 or email = $1
      limit 1
    `;

    const result = await pool.query(query, [value]);
    return result.rows[0] ?? null;
  },

  async findById(id) {
    const query = `
      select id, username, email, password_hash, created_at
      from users
      where id = $1
      limit 1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  },

  toPublicUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at
    };
  }
};

