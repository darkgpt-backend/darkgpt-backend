import { authService } from "../services/auth.service.js";
import { ApiError } from "../utils/api-error.js";

export async function requireAuth(request, _response, next) {
  try {
    const authHeader = request.headers.authorization ?? "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!accessToken) {
      throw new ApiError(401, "Missing access token.", "AUTH_REQUIRED");
    }

    const session = await authService.validateAccessToken(accessToken);
    request.auth = session;
    next();
  } catch (error) {
    next(error);
  }
}

