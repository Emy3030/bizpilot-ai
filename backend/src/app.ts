import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app: Application = express();

// crossOriginResourcePolicy defaults to 'same-origin', which silently blocks
// the frontend (a different port/origin) from loading <img> tags that point
// at /uploads on this server. 'cross-origin' allows that while keeping
// helmet's other protections intact.
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serves product images, generated PDFs, and QR codes from backend/uploads/
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

if (!env.isProduction) {
  app.use(morgan('dev'));
}

// Global rate limiter — generous, per-IP baseline protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
