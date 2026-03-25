import { pool } from "../db/pool.js";

export const usageRepository = {
  async findCounter({ userId, usageType, usagePeriod, periodKey }) {
    const query = `
      select id, user_id, usage_type, usage_period, period_key, count, created_at, updated_at
      from usage_counters
      where user_id = $1
        and usage_type = $2
        and usage_period = $3
        and period_key = $4
      limit 1
    `;

    const result = await pool.query(query, [userId, usageType, usagePeriod, periodKey]);
    return result.rows[0] ?? null;
  },

  async incrementCounter({ userId, usageType, usagePeriod, periodKey }) {
    const query = `
      insert into usage_counters (user_id, usage_type, usage_period, period_key, count)
      values ($1, $2, $3, $4, 1)
      on conflict (user_id, usage_type, usage_period, period_key)
      do update
      set count = usage_counters.count + 1,
          updated_at = now()
      returning id, user_id, usage_type, usage_period, period_key, count, created_at, updated_at
    `;

    const result = await pool.query(query, [userId, usageType, usagePeriod, periodKey]);
    return result.rows[0];
  }
};

