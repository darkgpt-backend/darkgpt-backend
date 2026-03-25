import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";
import { deviceBindingService } from "./device-binding.service.js";
import { integrityService } from "./integrity.service.js";

function addDurationToNow(durationText) {
  const match = /^(\d+)([mhd])$/.exec(durationText);
  if (!match) {
    return new Date(Date.now() + 15 * 60 * 1000);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return new Date(Date.now() + amount * multipliers[unit]);
}

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
  async register() {
    throw new ApiError(
      403,
      "Public sign-up is disabled. Only pre-created DarkGPT accounts can log in.",
      "PUBLIC_SIGNUP_DISABLED"
    );
  },

  async login({ username, password, deviceId, deviceName, integrityToken }) {
    if (!username || !password || !deviceId || !deviceName) {
      throw new ApiError(
        400,
        "Username, password, device ID, and device name are required.",
        "VALIDATION_ERROR"
      );
    }

    const user = await userRepository.findByUsername(username);

    if (!user) {
      throw new ApiError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
    }

    if (!user.is_active || !user.is_precreated) {
      throw new ApiError(403, "This account is not allowed to log in.", "LOGIN_NOT_ALLOWED");
    }

    return this.createSessionForUser({
      user,
      deviceId,
      deviceName,
      integrityToken
    });
  },

  async createSessionForUser({ user, deviceId, deviceName, integrityToken }) {
    const integrityResult = await integrityService.validateIntegrityToken(integrityToken);
    if (!integrityResult.valid) {
      throw new ApiError(401, "Integrity verification failed.", "INTEGRITY_FAILED");
    }

    const deviceCheck = await deviceBindingService.verifyDevice({
      user,
      deviceId,
      deviceName
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

    const accessExpiresAt = addDurationToNow(env.accessTokenExpiresIn);
    const refreshExpiresAt = addDurationToNow(env.refreshTokenExpiresIn);
    const session = await sessionRepository.createSession({
      userId: user.id,
      accessToken,
      refreshToken,
      deviceId,
      accessExpiresAt,
      refreshExpiresAt
    });

    return {
      user: userRepository.toPublicUser(user),
      session: {
        sessionId: session.id,
        accessToken,
        refreshToken,
        deviceId,
        deviceName,
        accessExpiresAt,
        refreshExpiresAt
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
    const accessExpiresAt = addDurationToNow(env.accessTokenExpiresIn);
    const refreshExpiresAt = addDurationToNow(env.refreshTokenExpiresIn);

    await sessionRepository.updateTokens(existingSession.id, {
      accessToken,
      refreshToken: nextRefreshToken,
      accessExpiresAt,
      refreshExpiresAt
    });

    return {
      session: {
        sessionId: existingSession.id,
        accessToken,
        refreshToken: nextRefreshToken,
        deviceId: existingSession.device_id,
        accessExpiresAt,
        refreshExpiresAt
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
