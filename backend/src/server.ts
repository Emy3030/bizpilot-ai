import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const CONNECT_RETRY_ATTEMPTS = 5;
const CONNECT_RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The Supabase pooler this project uses has shown intermittent connection
// blips (confirmed transient — retrying moments later succeeds every time).
// A single bad handshake during startup used to kill the process outright,
// and nodemon doesn't auto-restart a crashed run — so a momentary network
// hiccup meant a manual restart every time. Retries here, not a redesign.
async function connectWithRetry() {
  for (let attempt = 1; attempt <= CONNECT_RETRY_ATTEMPTS; attempt++) {
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      if (attempt === CONNECT_RETRY_ATTEMPTS) throw err;
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Database connection attempt ${attempt}/${CONNECT_RETRY_ATTEMPTS} failed, retrying in ${CONNECT_RETRY_DELAY_MS}ms...`);
      await sleep(CONNECT_RETRY_DELAY_MS);
    }
  }
}

async function bootstrap() {
  try {
    await connectWithRetry();
    // eslint-disable-next-line no-console
    console.log('✅ Database connected');

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 BizPilot AI API running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});

bootstrap();
