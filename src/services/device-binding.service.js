import { deviceRepository } from "../repositories/device.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";

export const deviceBindingService = {
  async verifyDevice({ user, deviceId, deviceName }) {
    if (!deviceId || !deviceName) {
      throw new ApiError(400, "Device ID and device name are required.", "DEVICE_REQUIRED");
    }

    const deviceRecord = await deviceRepository.findByDeviceId(deviceId);
    if (deviceRecord && deviceRecord.user_id !== user.id) {
      return {
        allowed: false,
        reason: "This device is already linked to another account."
      };
    }

    if (!user.device_id) {
      await userRepository.bindDevice({ userId: user.id, deviceId, deviceName });
      await deviceRepository.upsertBoundDevice({ userId: user.id, deviceId, deviceName });

      return {
        allowed: true,
        reason: "This device is now bound to the account."
      };
    }

    if (user.device_id !== deviceId) {
      return {
        allowed: false,
        reason: "This account is already bound to another device."
      };
    }

    await userRepository.touchLastLogin(user.id);
    await deviceRepository.touchDevice(user.id, deviceName);

    return {
      allowed: true,
      reason: "Device verified."
    };
  },

  async clearBinding(userId) {
    await userRepository.clearBoundDevice(userId);
    await deviceRepository.clearByUserId(userId);
  }
};
