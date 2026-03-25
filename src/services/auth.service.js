import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";
import { deviceBindingService } from "./device-binding.service.js";
import { integrityService } from "./integrity.service.js";

function createAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn
  });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn
  });
}

export const authService = {
  async register({ username, email, password, deviceId, deviceName }) {
    if (!username || !email || !password) {
      throw new ApiError(400, "Username, email, and password are required.", "VALIDATION_ERROR");
    }

    const existingUser = await userRepository.findByUsernameOrEmail(username) ??
      await userRepository.findByUsernameOrEmail(email);

    if (existingUser) {
      throw new ApiError(409, "A user with this username or email already exists.", "USER_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({ username, email, passwordHash });

    return this.createSessionForUser({
      user,
      deviceId: deviceId ?? "unknown-device",
      deviceName: deviceName ?? "Unknown Device",
      integrityToken: null
    });
  },

  async login({ usernameOrEmail, password, deviceId, deviceName, integrityToken }) {
    if (!usernameOrEmail || !password) {
      throw new ApiError(400, "Username/email and password are required.", "VALIDATION_ERROR");
    }

    const user = await userRepository.findByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      throw new ApiError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
    }

    return this.createSessionForUser({
      user,
      deviceId: deviceId ?? "unknown-device",
      deviceName: deviceName ?? "Unknown Device",
      integrityToken
    });
  },

  async createSessionForUser({ user, deviceId, deviceName, integrityToken }) {
    const integrityResult = await integrityService.validateIntegrityToken(integrityToken);
    if (!integrityResult.valid) {
      throw new ApiError(401, "Integrity verification failed.", "INTEGRITY_FAILED");
    }

    const deviceCheck = await deviceBindingService.verifyDevice({
      userId: user.id,
      deviceId
    });

    if (!deviceCheck.allowed) {
      throw new ApiError(403, "This account is locked to another device.", "DEVICE_NOT_ALLOWED");
    }

    const accessToken = createAccessToken({
      userId: user.id,
      username: user.username
    });
    const refreshToken = createRefreshToken({
      userId: user.id
    });

    const session = await sessionRepository.createSession({
      userId: user.id,
      accessToken,
      refreshToken,
      deviceId,
      deviceName
    });

    return {
      user: userRepository.toPublicUser(user),
      session: {
        sessionId: session.id,
        accessToken,
        refreshToken,
        deviceId,
        deviceName
      }
    };
  },

  async refreshSession({ refreshToken, deviceId, integrityToken }) {
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required.", "VALIDATION_ERROR");
    }

    const integrityResult = await integrityService.validateIntegrityToken(integrityToken);
    if (!integrityResult.valid) {
      throw new ApiError(401, "Integrity verification failed.", "INTEGRITY_FAILED");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
    } catch (_error) {
      throw new ApiError(401, "Invalid refresh token.", "INVALID_REFRESH_TOKEN");
    }

    const existingSession = await sessionRepository.findByRefreshToken(refreshToken);
    if (!existingSession || existingSession.is_revoked) {
      throw new ApiError(401, "Session not found or revoked.", "SESSION_INVALID");
    }

    if (deviceId && existingSession.device_id !== deviceId) {
      throw new ApiError(403, "Refresh token is not valid for this device.", "DEVICE_MISMATCH");
    }

    const accessToken = createAccessToken({
      userId: decoded.userId
    });
    const nextRefreshToken = createRefreshToken({
      userId: decoded.userId
    });

    await sessionRepository.updateTokens(existingSession.id, {
      accessToken,
      refreshToken: nextRefreshToken
    });

    return {
      session: {
        sessionId: existingSession.id,
        accessToken,
        refreshToken: nextRefreshToken,
        deviceId: existingSession.device_id,
        deviceName: existingSession.device_name
      }
    };
  },

  async validateAccessToken(accessToken) {
    let decoded;
    try {
      decoded = jwt.verify(accessToken, env.jwtAccessSecret);
    } catch (_error) {
      throw new ApiError(401, "Invalid access token.", "INVALID_ACCESS_TOKEN");
    }

    const session = await sessionRepository.findByAccessToken(accessToken);
    if (!session || session.is_revoked) {
      throw new ApiError(401, "Session not found or revoked.", "SESSION_INVALID");
    }

    return {
      userId: decoded.userId,
      username: decoded.username,
      sessionId: session.id
    };
  },

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
    }

    return userRepository.toPublicUser(user);
  },

  async logout(sessionId) {
    await sessionRepository.revokeSession(sessionId);
  }
};

