import express from 'express';

import {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantIsolation } from '../middleware/tenant.middleware.js';

const router = express.Router();

/* =========================
   TASK ROUTES
========================= */

// Create task under project
router.post(
  '/projects/:projectId/tasks',
  authMiddleware,
  tenantIsolation,
  createTask
);

// List tasks of a project
router.get(
  '/projects/:projectId/tasks',
  authMiddleware,
  tenantIsolation,
  listProjectTasks
);

// Update task status only
router.patch(
  '/tasks/:taskId/status',
  authMiddleware,
  tenantIsolation,
  updateTaskStatus
);

// Update task (all fields)
router.put(
  '/tasks/:taskId',
  authMiddleware,
  tenantIsolation,
  updateTask
);

// Delete task (recommended)
router.delete(
  '/tasks/:taskId',
  authMiddleware,
  tenantIsolation,
  deleteTask
);

export default router;
