import { env } from '../config/env';

/**
 * NOT_CONNECTED       — no credentials configured for this environment.
 * PENDING_CONFIGURATION — credentials are set, but no confirmed Cleanverse
 *                         API contract exists yet to implement a real call
 *                         against (see callCleanverseApi below).
 * CONNECTED           — reserved: a real Cleanverse call succeeded but the
 *                        proof itself is still processing on their side.
 * VERIFIED            — reserved: Cleanverse confirmed this document's
 *                        proof is valid.
 *
 * Only NOT_CONNECTED and PENDING_CONFIGURATION are reachable today. The
 * other two exist in the type now so every caller already renders them
 * correctly the moment a real integration lands — nothing UI-side needs to
 * change, only callCleanverseApi's body.
 */
export type CleanverseConnectionState = 'NOT_CONNECTED' | 'PENDING_CONFIGURATION' | 'CONNECTED' | 'VERIFIED';

export interface CleanverseTrustResult {
  state: CleanverseConnectionState;
  message: string;
  proofId?: string;
  proofUrl?: string;
}

const CALL_TIMEOUT_MS = 8000;

/**
 * Stub for the real Cleanverse CVI/CVA call. Deliberately throws — there is
 * no documented Cleanverse endpoint, request shape, or auth scheme in this
 * project to implement against, and guessing one would be exactly the kind
 * of fabrication this adapter exists to avoid. Wrapped in a timeout/AbortController
 * already so that when a real `fetch(...)` replaces the body, a slow or
 * hanging Cleanverse endpoint can never stall a document/verify request —
 * it fails safely into PENDING_CONFIGURATION instead.
 */
async function callCleanverseApi(_documentHash: string): Promise<CleanverseTrustResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  try {
    throw new Error('No confirmed Cleanverse API contract to call yet');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Adapter boundary for Cleanverse's CVI/CVA trust layer, sitting alongside
 * (not replacing) the existing Base Sepolia anchoring in blockchain.service.ts.
 *
 * Every caller (verify.service.ts, sale.service.ts) already handles all
 * four states correctly, so wiring up the real Cleanverse call later is a
 * one-function change inside callCleanverseApi — not an application
 * rewrite, which is the point of this being a separate adapter.
 */
export const cleanverseTrustService = {
  isConfigured(): boolean {
    return !!(env.cleanverseApiUrl && env.cleanverseApiKey);
  },

  async getTrustState(documentHash: string): Promise<CleanverseTrustResult> {
    if (!this.isConfigured()) {
      return {
        state: 'NOT_CONNECTED',
        message:
          'Cleanverse is not connected. Set CLEANVERSE_API_URL and CLEANVERSE_API_KEY to enable CVI/CVA verification for this business.',
      };
    }

    try {
      return await callCleanverseApi(documentHash);
    } catch {
      // Credentials are present but the real call isn't implemented (or, once
      // it is, failed/timed out) — surfaced honestly rather than fabricating
      // a verified response.
      return {
        state: 'PENDING_CONFIGURATION',
        message: 'Cleanverse credentials are set, but the real CVI/CVA API call has not been implemented yet.',
      };
    }
  },
};
