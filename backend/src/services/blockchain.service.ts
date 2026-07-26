import { ethers } from 'ethers';
import { env } from '../config/env';
import { TRUST_REGISTRY_ABI } from '../config/contractAbi';

let contract: ethers.Contract | null = null;

function getContract(): ethers.Contract | null {
  if (!env.blockchainPrivateKey || !env.trustRegistryContractAddress) return null;

  if (!contract) {
    const provider = new ethers.JsonRpcProvider(env.baseSepoliaRpcUrl);
    const wallet = new ethers.Wallet(env.blockchainPrivateKey, provider);
    contract = new ethers.Contract(env.trustRegistryContractAddress, TRUST_REGISTRY_ABI, wallet);
  }

  return contract;
}

export const blockchainService = {
  isConfigured(): boolean {
    return !!(env.blockchainPrivateKey && env.trustRegistryContractAddress);
  },

  /**
   * Anchors a SHA-256 document hash on Base Sepolia.
   * Returns null (never throws) if blockchain isn't configured or the
   * transaction fails — callers should treat that as "not anchored yet"
   * rather than a hard error, since invoices/receipts must still work
   * even when the chain is unreachable.
   */
  async anchorHash(documentHash: string): Promise<{ txHash: string } | null> {
    const c = getContract();
    if (!c) return null;

    try {
      const bytes32Hash = documentHash.startsWith('0x') ? documentHash : `0x${documentHash}`;
      const tx = await c.anchorDocument(bytes32Hash);
      const receipt = await tx.wait(1);
      return { txHash: receipt?.hash || tx.hash };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Blockchain] Failed to anchor document hash:', error);
      return null;
    }
  },

  getExplorerUrl(txHash: string): string {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  },
};
