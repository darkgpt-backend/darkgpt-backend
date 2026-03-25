import { userRepository } from "../repositories/user.repository.js";
import { usageRepository } from "../repositories/usage.repository.js";
import { ApiError } from "../utils/api-error.js";

function getUsageDates() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, "0");
  const utcDay = String(now.getUTCDate()).padStart(2, "0");

  return {
    dailyDate: `${utcYear}-${utcMonth}-${utcDay}`,
    monthlyDate: `${utcYear}-${utcMonth}-01`
  };
}

export const usageService = {
  async assertCanUseAi(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
    }

    const { dailyDate, monthlyDate } = getUsageDates();
    const dailyUsage = await usageRepository.findDailyUsage(userId, dailyDate);
    const monthlyUsage = await usageRepository.findMonthlyUsage(userId, monthlyDate);

    if ((dailyUsage?.request_count ?? 0) >= user.daily_ai_limit) {
      throw new ApiError(429, "Daily AI usage limit reached.", "DAILY_LIMIT_REACHED");
    }

    if ((monthlyUsage?.request_count ?? 0) >= user.monthly_ai_limit) {
      throw new ApiError(429, "Monthly AI usage limit reached.", "MONTHLY_LIMIT_REACHED");
    }
  },

  async recordAiUsage(userId) {
    const { dailyDate, monthlyDate } = getUsageDates();

    await usageRepository.incrementDailyUsage(userId, dailyDate);
    await usageRepository.incrementMonthlyUsage(userId, monthlyDate);
  }
};

