import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import apiRouter from './routes/api';

const app = express();

// Trust reverse proxy (Render, Cloudflare, AWS ALB) for accurate client IP resolution
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible API and static asset usage
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow requests with no origin (same-origin, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Allow localhost and local loopback
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      // 3. Allow all Render deployments (*.onrender.com) and Vercel deployments (*.vercel.app)
      if (origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 4. Allow explicit CORS_ORIGIN or wildcard
      if (!env.CORS_ORIGIN || env.CORS_ORIGIN === '*' || origin === env.CORS_ORIGIN) {
        return callback(null, true);
      }

      // 5. Default allow to prevent blocking user domains
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing with payload size controls
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API router
app.use('/api', apiRouter);

// Serve static frontend in production if built
const frontendDistPaths = [
  path.join(process.cwd(), 'public-frontend'),
  path.join(__dirname, '../public-frontend'),
  path.join(__dirname, '../../frontend/dist'),
];

const activeFrontendDist = frontendDistPaths.find(p => fs.existsSync(p));

if (activeFrontendDist) {
  app.use(express.static(activeFrontendDist));
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.path}` });
    }
    res.sendFile(path.join(activeFrontendDist, 'index.html'));
  });
} else {
  // 404 handler for API or standalone server
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Cannot ${req.method} ${req.path}`,
    });
  });
}

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[App Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
