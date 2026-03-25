import { chatService } from "../services/chat.service.js";

export const chatController = {
  async listChats(request, response, next) {
    try {
      const chats = await chatService.listChats(request.auth.userId);
      response.json({ chats });
    } catch (error) {
      next(error);
    }
  },

  async createChat(request, response, next) {
    try {
      const chat = await chatService.createChat(request.auth.userId, {
        title: request.body.title,
        category: request.body.category
      });

      response.status(201).json({ chat });
    } catch (error) {
      next(error);
    }
  },

  async listMessages(request, response, next) {
    try {
      const messages = await chatService.listMessages(request.auth.userId, request.params.chatId);
      response.json({ messages });
    } catch (error) {
      next(error);
    }
  },

  async createMessage(request, response, next) {
    try {
      const result = await chatService.createMessage(request.auth.userId, request.params.chatId, {
        content: request.body.content,
        role: request.body.role ?? "user"
      });

      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
};

