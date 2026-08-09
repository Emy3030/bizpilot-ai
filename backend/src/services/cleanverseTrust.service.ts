import { env } from '../config/env';

export type CleanverseConnectionState = 'NOT_CONNECTED' | 'PENDING_CONFIGURATION' | 'CONNECTED';

export interface CleanverseTrustResult {
  state: CleanverseConnectionState;
  message: string;
  proofId?: string;
  proofUrl?: string;
}

/**
 * Adapter boundary for Cleanverse's CVI/CVA trust layer, sitting alongside
 * (not replacing) the existing Base Sepolia anchoring in blockchain.service.ts.
 *
 * No real Cleanverse API contract — endpoint shape, auth scheme, response
 * format — is available in this codebase, its docs, or its environment.
 * Nothing below calls a fabricated endpoint or invents a response. Every
 * caller of this service (verify.service.ts, sale.service.ts) already
 * handles all three connection states correctly, so wiring up the real
 * Cleanverse call later is a one-function change here — not an application
 * rewrite, which is the point of this being a separate adapter.
 */
export const cleanverseTrustService = {
  isConfigured(): boolean {
    return !!(env.cleanverseApiUrl && env.cleanverseApiKey);
  },

  async getTrustState(_documentHash: string): Promise<CleanverseTrustResult> {
    if (!this.isConfigured()) {
      return {
        state: 'NOT_CONNECTED',
        message:
          'Cleanverse is not connected. Set CLEANVERSE_API_URL and CLEANVERSE_API_KEY to enable CVI/CVA verification for this business.',
      };
    }

    // Credentials are present, but there is no confirmed Cleanverse API
    // contract in this project to implement a real call against yet.
    // Surfaced honestly as "pending" rather than fabricating a verified
    // response — replace this branch with the real Cleanverse call once
    // the API is documented.
    return {
      state: 'PENDING_CONFIGURATION',
      message: 'Cleanverse credentials are set, but the real CVI/CVA API call has not been implemented yet.',
    };
  },
};
