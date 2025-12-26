import express from 'express';

import {
  addUser,
  listUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { tenantIsolation } from '../middleware/tenant.middleware.js';

const router = express.Router();

/* =========================
   USER MANAGEMENT ROUTES
========================= */

// Add user to tenant (tenant_admin only)
router.post(
  '/tenants/:tenantId/users',
  authMiddleware,
  authorizeRoles('tenant_admin'),
  tenantIsolation,
  addUser
);

// List users in tenant (any tenant user)
router.get(
  '/tenants/:tenantId/users',
  authMiddleware,
  tenantIsolation,
  listUsers
);

// Update user (tenant_admin or self)
router.put(
  '/users/:userId',
  authMiddleware,
  updateUser
);

// Delete user (tenant_admin only)
router.delete(
  '/users/:userId',
  authMiddleware,
  authorizeRoles('tenant_admin'),
  deleteUser
);

export default router;
