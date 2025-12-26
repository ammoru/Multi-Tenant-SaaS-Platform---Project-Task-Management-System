import express from 'express';

import {
  getTenantDetails,
  updateTenant,
  listTenants,
} from '../controllers/tenant.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

/* =========================
   TENANT ROUTES
========================= */

// Get tenant details (Tenant user or Super Admin)
router.get(
  '/:tenantId',
  authMiddleware,
  getTenantDetails
);

// Update tenant
router.put(
  '/:tenantId',
  authMiddleware,
  authorizeRoles('tenant_admin', 'super_admin'),
  updateTenant
);

// List all tenants (Super Admin ONLY)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('super_admin'),
  listTenants
);

export default router;
