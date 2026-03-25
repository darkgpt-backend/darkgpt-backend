import { pool } from "../db/pool.js";

export const usageRepository = {
  async findDailyUsage(userId, usageDate) {
    const result = await pool.query(
      `
        select id, user_id, usage_date, request_count, input_tokens, output_tokens, created_at, updated_at
        from daily_ai_usage
        where user_id = $1 and usage_date = $2
        limit 1
      `,
      [userId, usageDate]
    );

    return result.rows[0] ?? null;
  },

  async incrementDailyUsage(userId, usageDate) {
    const result = await pool.query(
      `
        insert into daily_ai_usage (user_id, usage_date, request_count)
        values ($1, $2, 1)
        on conflict (user_id, usage_date)
        do update
        set request_count = daily_ai_usage.request_count + 1,
            updated_at = now()
        returning id, user_id, usage_date, request_count, input_tokens, output_tokens, created_at, updated_at
      `,
      [userId, usageDate]
    );

    return result.rows[0];
  },

  async findMonthlyUsage(userId, usageMonth) {
    const result = await pool.query(
      `
        select id, user_id, usage_month, request_count, input_tokens, output_tokens, created_at, updated_at
        from monthly_ai_usage
        where user_id = $1 and usage_month = $2
        limit 1
      `,
      [userId, usageMonth]
    );

    return result.rows[0] ?? null;
  },

  async incrementMonthlyUsage(userId, usageMonth) {
    const result = await pool.query(
      `
        insert into monthly_ai_usage (user_id, usage_month, request_count)
        values ($1, $2, 1)
        on conflict (user_id, usage_month)
        do update
        set request_count = monthly_ai_usage.request_count + 1,
            updated_at = now()
        returning id, user_id, usage_month, request_count, input_tokens, output_tokens, created_at, updated_at
      `,
      [userId, usageMonth]
    );

    return result.rows[0];
  }
};

