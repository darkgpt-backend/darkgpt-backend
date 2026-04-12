import { chatTerminalService } from "../services/chat-terminal.service.js";

export const chatTerminalController = {
  async generate(request, response, next) {
    try {
      const result = await chatTerminalService.generateOutput(request.auth, {
        action: request.body.action
      });

      response.json({
        action: result.action,
        output: result.output
      });
    } catch (error) {
      next(error);
    }
  }
};
