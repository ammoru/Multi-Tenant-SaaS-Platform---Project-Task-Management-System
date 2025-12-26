import express from 'express';

import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantIsolation } from '../middleware/tenant.middleware.js';

const router = express.Router();

/* =========================
   PROJECT ROUTES
========================= */

// Create project
router.post(
  '/',
  authMiddleware,
  tenantIsolation,
  createProject
);

// List projects
router.get(
  '/',
  authMiddleware,
  tenantIsolation,
  listProjects
);

// Update project
router.put(
  '/:projectId',
  authMiddleware,
  tenantIsolation,
  updateProject
);

// Delete project
router.delete(
  '/:projectId',
  authMiddleware,
  tenantIsolation,
  deleteProject
);

export default router;
