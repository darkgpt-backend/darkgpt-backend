import { env } from "../config/env.js";

// This is where Play Integrity / app attestation validation will later run.
export const integrityService = {
  async validateIntegrityToken(integrityToken) {
    return {
      valid: !env.playIntegrityEnabled || Boolean(integrityToken),
      enforced: env.playIntegrityEnabled,
      reason: env.playIntegrityEnabled
        ? "Replace this placeholder with real Play Integrity verification."
        : "Play Integrity is not enabled yet."
    };
  }
};

