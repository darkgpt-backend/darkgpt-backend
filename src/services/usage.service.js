import { env } from "../config/env.js";
import { usageRepository } from "../repositories/usage.repository.js";
import { ApiError } from "../utils/api-error.js";

function getUtcDateParts() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  return {
    dailyKey: `${year}-${month}-${day}`,
    monthlyKey: `${year}-${month}`
  };
}

export const usageService = {
  async assertCanUseAi(userId) {
    const { dailyKey, monthlyKey } = getUtcDateParts();

    const dailyUsage = await usageRepository.findCounter({
      userId,
      usageType: "ai_messages",
      usagePeriod: "daily",
      periodKey: dailyKey
    });

    if ((dailyUsage?.count ?? 0) >= env.dailyAiMessageLimit) {
      throw new ApiError(429, "Daily AI usage limit reached.", "DAILY_LIMIT_REACHED");
    }

    const monthlyUsage = await usageRepository.findCounter({
      userId,
      usageType: "ai_messages",
      usagePeriod: "monthly",
      periodKey: monthlyKey
    });

    if ((monthlyUsage?.count ?? 0) >= env.monthlyAiMessageLimit) {
      throw new ApiError(429, "Monthly AI usage limit reached.", "MONTHLY_LIMIT_REACHED");
    }
  },

  async recordAiUsage(userId) {
    const { dailyKey, monthlyKey } = getUtcDateParts();

    await usageRepository.incrementCounter({
      userId,
      usageType: "ai_messages",
      usagePeriod: "daily",
      periodKey: dailyKey
    });

    await usageRepository.incrementCounter({
      userId,
      usageType: "ai_messages",
      usagePeriod: "monthly",
      periodKey: monthlyKey
    });
  }
};

