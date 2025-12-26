import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();

/* =========================
   GLOBAL MIDDLEWARES
========================= */

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS (Docker + Local Safe)
app.use(
  cors(
  //   {
  //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  //   credentials: true,
  // }
)
);

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* =========================
   HEALTH CHECK (MANDATORY)
========================= */

app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected',
  });
});

/* =========================
   API ROUTES
========================= */

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

export default app;
