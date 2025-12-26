import express from 'express';
import {
  registerTenant,
  login,
  getCurrentUser,
  logout,
} from '../controllers/auth.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/* =========================
   AUTH ROUTES
========================= */

// Tenant Registration (Public)
router.post('/register-tenant', registerTenant);

// Login (Public)
router.post('/login', login);

// Get Current User (Protected)
router.get('/me', authMiddleware, getCurrentUser);

// Logout (Protected)
router.post('/logout', authMiddleware, logout);

export default router;
