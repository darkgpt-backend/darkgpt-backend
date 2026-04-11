import { ApiError } from "../utils/api-error.js";

export const chatSendService = {
  async sendMessage(userId, { message }) {
    const normalizedMessage = message?.trim();

    if (!normalizedMessage) {
      throw new ApiError(400, "Message is required.", "VALIDATION_ERROR");
    }

    return {
      userId,
      reply: `You said: ${normalizedMessage}`
    };
  }
};
