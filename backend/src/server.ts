import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

async function bootstrap() {
  try {
    await prisma.$connect();
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
