import { deviceBindingService } from "./device-binding.service.js";
import { usageService } from "./usage.service.js";
import { userRepository } from "../repositories/user.repository.js";

export const adminUserService = {
  async setAccountActive(userId, isActive) {
    return userRepository.setActiveState(userId, isActive);
  },

  async updateLimits(userId, { limitEnabled, dailyAiLimit, monthlyAiLimit }) {
    return userRepository.updateLimits(userId, {
      limitEnabled,
      dailyAiLimit,
      monthlyAiLimit
    });
  },

  async resetUsage(userId) {
    return usageService.resetUsage(userId);
  },

  async resetDeviceBinding(userId) {
    await deviceBindingService.clearBinding(userId);
    return userRepository.findById(userId);
  }
};

