import { userRepository } from "./user.repository.js";

function getTodayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthUtc() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export const usageRepository = {
  async getUserUsageState(userId) {
    return userRepository.findById(userId);
  },

  async refreshUsageWindows(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const today = getTodayUtc();
    const currentMonth = getCurrentMonthUtc();

    const shouldResetDaily = String(user.daily_usage_reset_at) !== today;
    const shouldResetMonthly = String(user.monthly_usage_reset_at) !== currentMonth;

    if (!shouldResetDaily && !shouldResetMonthly) {
      return user;
    }

    return userRepository.replaceUsageSnapshot(userId, {
      dailyAiUsed: shouldResetDaily ? 0 : user.daily_ai_used,
      monthlyAiUsed: shouldResetMonthly ? 0 : user.monthly_ai_used,
      dailyResetAt: shouldResetDaily ? today : user.daily_usage_reset_at,
      monthlyResetAt: shouldResetMonthly ? currentMonth : user.monthly_usage_reset_at
    });
  },

  async addUsage(userId, tokensUsed) {
    return userRepository.addUsage(userId, tokensUsed);
  },

  async resetUsage(userId) {
    return userRepository.replaceUsageSnapshot(userId, {
      dailyAiUsed: 0,
      monthlyAiUsed: 0,
      dailyResetAt: getTodayUtc(),
      monthlyResetAt: getCurrentMonthUtc()
    });
  }
};

