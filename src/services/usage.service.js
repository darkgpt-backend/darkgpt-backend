import { usageRepository } from "../repositories/usage.repository.js";
import { ApiError } from "../utils/api-error.js";

export const usageService = {
  async assertCanUseAi(userId, requestedTokens = 0) {
    const user = await usageRepository.refreshUsageWindows(userId);
    if (!user) {
      throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
    }

    if (!user.limit_enabled) {
      return;
    }

    if (user.daily_ai_used + requestedTokens > user.daily_ai_limit) {
      throw new ApiError(429, "Daily AI token limit reached.", "DAILY_LIMIT_REACHED");
    }

    if (user.monthly_ai_used + requestedTokens > user.monthly_ai_limit) {
      throw new ApiError(429, "Monthly AI token limit reached.", "MONTHLY_LIMIT_REACHED");
    }
  },

  async recordAiUsage(userId, tokensUsed) {
    if (tokensUsed <= 0) {
      return;
    }

    await usageRepository.addUsage(userId, tokensUsed);
  },

  async resetUsage(userId) {
    return usageRepository.resetUsage(userId);
  }
};
