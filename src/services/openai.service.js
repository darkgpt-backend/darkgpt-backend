import { env } from "../config/env.js";

// Android should never call OpenAI directly.
// Later the chat service will use this file to send prompts to OpenAI safely from the backend.
export const openAiService = {
  async createChatCompletion({ messages }) {
    return {
      provider: "openai",
      connected: Boolean(env.openAiApiKey),
      model: env.openAiModel,
      reply: env.openAiApiKey
        ? "Hook your real OpenAI SDK call here."
        : "OPENAI_API_KEY is not set yet. This is a placeholder response.",
      messagesReceived: messages.length
    };
  }
};

