import { healthService } from "../services/health.service.js";

export const healthController = {
  async getHealth(_request, response, next) {
    try {
      const result = await healthService.getStatus();
      response.json(result);
    } catch (error) {
      next(error);
    }
  }
};

