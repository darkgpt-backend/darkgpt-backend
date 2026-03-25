import { env } from "../config/env.js";

// This service is intentionally simple for now.
// Later it will enforce one account per device using backend rules.
export const deviceBindingService = {
  async verifyDevice({ userId, deviceId }) {
    return {
      allowed: true,
      enforced: env.deviceBindingEnabled,
      reason: env.deviceBindingEnabled
        ? "Device binding checks will be implemented here."
        : "Device binding is not enabled yet.",
      userId,
      deviceId
    };
  }
};

