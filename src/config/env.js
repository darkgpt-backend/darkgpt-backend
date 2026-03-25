import dotenv from "dotenv";

dotenv.config();

function required(name, fallback = "") {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseAllowedOrigins(value) {
  if (!value || value === "*") {
    return "*";
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  appBaseUrl: process.env.APP_BASE_URL ?? "https://api.darkgpt.example",
  corsOrigin: parseAllowedOrigins(process.env.CORS_ORIGIN ?? "*"),
  trustProxy: process.env.TRUST_PROXY === "true",
  databaseUrl: required("DATABASE_URL", "postgresql://postgres:password@localhost:5432/darkgpt"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "replace_with_a_long_random_secret"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "replace_with_another_long_random_secret"),
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "30d",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  dailyAiMessageLimit: Number(process.env.DAILY_AI_MESSAGE_LIMIT ?? 100),
  monthlyAiMessageLimit: Number(process.env.MONTHLY_AI_MESSAGE_LIMIT ?? 1000),
  deviceBindingEnabled: process.env.DEVICE_BINDING_ENABLED === "true",
  playIntegrityEnabled: process.env.PLAY_INTEGRITY_ENABLED === "true"
};
