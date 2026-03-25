import { pool } from "../db/pool.js";

export const deviceRepository = {
  async findByUserId(userId) {
    const result = await pool.query(
      `
        select id, user_id, device_id, device_name, platform, app_version, verified_at, first_seen_at, last_seen_at
        from devices
        where user_id = $1
        limit 1
      `,
      [userId]
    );

    return result.rows[0] ?? null;
  },

  async findByDeviceId(deviceId) {
    const result = await pool.query(
      `
        select id, user_id, device_id, device_name, platform, app_version, verified_at, first_seen_at, last_seen_at
        from devices
        where device_id = $1
        limit 1
      `,
      [deviceId]
    );

    return result.rows[0] ?? null;
  },

  async upsertBoundDevice({ userId, deviceId, deviceName, platform = "android", appVersion = null }) {
    const query = `
      insert into devices (user_id, device_id, device_name, platform, app_version)
      values ($1, $2, $3, $4, $5)
      on conflict (user_id)
      do update
      set device_id = excluded.device_id,
          device_name = excluded.device_name,
          platform = excluded.platform,
          app_version = excluded.app_version,
          verified_at = now(),
          last_seen_at = now()
      returning id, user_id, device_id, device_name, platform, app_version, verified_at, first_seen_at, last_seen_at
    `;

    const result = await pool.query(query, [userId, deviceId, deviceName, platform, appVersion]);
    return result.rows[0];
  },

  async touchDevice(userId, deviceName) {
    await pool.query(
      `
        update devices
        set device_name = $2,
            last_seen_at = now(),
            verified_at = now()
        where user_id = $1
      `,
      [userId, deviceName]
    );
  },

  async clearByUserId(userId) {
    await pool.query(
      `
        delete from devices
        where user_id = $1
      `,
      [userId]
    );
  }
};
