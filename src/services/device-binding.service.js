import { deviceRepository } from "../repositories/device.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";

export const deviceBindingService = {
  async verifyDevice({ user, deviceId, deviceName }) {
    if (!deviceId || !deviceName) {
      throw new ApiError(400, "Device ID and device name are required.", "DEVICE_REQUIRED");
    }

    if (!user.device_binding_required) {
      return {
        allowed: true,
        enforced: false,
        reason: "Device binding is disabled for this account."
      };
    }

    const deviceRecord = await deviceRepository.findByDeviceId(deviceId);
    if (deviceRecord && deviceRecord.user_id !== user.id) {
      return {
        allowed: false,
        enforced: true,
        reason: "This device is already linked to another account."
      };
    }

    if (!user.bound_device_id) {
      await userRepository.bindDevice({
        userId: user.id,
        deviceId,
        deviceName
      });
      await deviceRepository.upsertBoundDevice({
        userId: user.id,
        deviceId,
        deviceName
      });

      return {
        allowed: true,
        enforced: true,
        reason: "This device is now bound to the account for the first time."
      };
    }

    if (user.bound_device_id !== deviceId) {
      return {
        allowed: false,
        enforced: true,
        reason: "This account is already locked to another device."
      };
    }

    await userRepository.touchLastLogin(user.id);
    await deviceRepository.touchDevice(user.id, deviceName);

    return {
      allowed: true,
      enforced: true,
      reason: "Device verified successfully.",
      userId: user.id,
      deviceId
    };
  }
};

