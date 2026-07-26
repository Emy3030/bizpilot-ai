import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  newsApiKey: process.env.NEWS_API_KEY || '',
  baseSepoliaRpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
  blockchainPrivateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  trustRegistryContractAddress: process.env.TRUST_REGISTRY_CONTRACT_ADDRESS || '',
  isProduction: process.env.NODE_ENV === 'production',
};
