import { chatRepository } from "../repositories/chat.repository.js";
import { usageService } from "./usage.service.js";
import { ApiError } from "../utils/api-error.js";
import { openAiService } from "./openai.service.js";

function estimateTokens(text) {
  return Math.max(1, Math.ceil((text?.length ?? 0) / 4));
}

export const chatService = {
  async listChats(userId) {
    return chatRepository.listChatsByUserId(userId);
  },

  async createChat(userId, { title, category }) {
    if (!category) {
      throw new ApiError(400, "Chat category is required.", "VALIDATION_ERROR");
    }

    return chatRepository.createChat({
      userId,
      title: title || "New DarkGPT Chat",
      category
    });
  },

  async listMessages(userId, chatId) {
    await this.ensureChatAccess(userId, chatId);
    return chatRepository.listMessages(chatId);
  },

  async createMessage(userId, chatId, { content, role }) {
    if (!content) {
      throw new ApiError(400, "Message content is required.", "VALIDATION_ERROR");
    }

    await this.ensureChatAccess(userId, chatId);
    const requestedTokens = estimateTokens(content);
    await usageService.assertCanUseAi(userId, requestedTokens);

    const userMessage = await chatRepository.createMessage({
      chatId,
      role,
      content
    });

    const aiResult = await openAiService.createChatCompletion({
      messages: [{ role, content }]
    });

    const assistantMessage = await chatRepository.createMessage({
      chatId,
      role: "assistant",
      content: aiResult.reply
    });
    const totalTokensUsed = requestedTokens + estimateTokens(aiResult.reply);
    await usageService.recordAiUsage(userId, totalTokensUsed);

    return {
      userMessage,
      assistantMessage,
      openAi: {
        connected: aiResult.connected,
        model: aiResult.model
      }
    };
  },

  async ensureChatAccess(userId, chatId) {
    const chat = await chatRepository.findChatById(chatId);
    if (!chat || chat.user_id !== userId) {
      throw new ApiError(404, "Chat not found.", "CHAT_NOT_FOUND");
    }
  }
};
