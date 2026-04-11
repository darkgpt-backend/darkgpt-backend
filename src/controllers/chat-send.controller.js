import { chatSendService } from "../services/chat-send.service.js";

export const chatSendController = {
  async send(request, response, next) {
    try {
      const result = await chatSendService.sendMessage(request.auth.userId, {
        message: request.body.message
      });

      response.json({
        reply: result.reply
      });
    } catch (error) {
      next(error);
    }
  }
};
