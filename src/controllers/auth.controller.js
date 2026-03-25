import { authService } from "../services/auth.service.js";

export const authController = {
  async login(request, response, next) {
    try {
      const result = await authService.login({
        usernameOrEmail: request.body.usernameOrEmail,
        password: request.body.password,
        deviceId: request.body.deviceId,
        deviceName: request.body.deviceName,
        integrityToken: request.body.integrityToken ?? null
      });

      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refreshSession(request, response, next) {
    try {
      const result = await authService.refreshSession({
        refreshToken: request.body.refreshToken,
        deviceId: request.body.deviceId,
        integrityToken: request.body.integrityToken ?? null
      });

      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(request, response, next) {
    try {
      await authService.logout(request.auth.sessionId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async me(request, response, next) {
    try {
      const user = await authService.getCurrentUser(request.auth.userId);
      response.json({ user });
    } catch (error) {
      next(error);
    }
  }
};
