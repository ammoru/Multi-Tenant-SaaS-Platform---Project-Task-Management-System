import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

/* =====================================================
   GET TENANT DETAILS
   GET /api/tenants/:tenantId
===================================================== */
export const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    // Tenant users can only access their own tenant
    if (role !== 'super_admin' && userTenantId.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    // Stats
    const totalUsers = await User.countDocuments({ tenantId });
    const totalProjects = await Project.countDocuments({ tenantId });
    const totalTasks = await Task.countDocuments({ tenantId });

    return res.status(200).json({
      success: true,
      data: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscriptionPlan,
        maxUsers: tenant.maxUsers,
        maxProjects: tenant.maxProjects,
        createdAt: tenant.createdAt,
        stats: {
          totalUsers,
          totalProjects,
          totalTasks,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant details',
    });
  }
};

/* =====================================================
   UPDATE TENANT
   PUT /api/tenants/:tenantId
===================================================== */
export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    // Tenant admin can update ONLY their own tenant
    if (role === 'tenant_admin' && userTenantId.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant update',
      });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const updates = {};

    // Tenant admin: only name allowed
    if (role === 'tenant_admin') {
      if (req.body.name) updates.name = req.body.name;

      if (
        req.body.status ||
        req.body.subscriptionPlan ||
        req.body.maxUsers ||
        req.body.maxProjects
      ) {
        return res.status(403).json({
          success: false,
          message: 'Tenant admin cannot update these fields',
        });
      }
    }

    // Super admin: can update all
    if (role === 'super_admin') {
      const allowedFields = [
        'name',
        'status',
        'subscriptionPlan',
        'maxUsers',
        'maxProjects',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      updates,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id: updatedTenant._id,
        name: updatedTenant.name,
        updatedAt: updatedTenant.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
    });
  }
};

/* =====================================================
   LIST ALL TENANTS (SUPER ADMIN ONLY)
   GET /api/tenants
===================================================== */
export const listTenants = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, subscriptionPlan } = req.query;

    const query = {};
    if (status) query.status = status;
    if (subscriptionPlan) query.subscriptionPlan = subscriptionPlan;

    const tenants = await Tenant.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalTenants = await Tenant.countDocuments(query);

    // Add stats for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const totalUsers = await User.countDocuments({ tenantId: tenant._id });
        const totalProjects = await Project.countDocuments({ tenantId: tenant._id });

        return {
          id: tenant._id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          status: tenant.status,
          subscriptionPlan: tenant.subscriptionPlan,
          totalUsers,
          totalProjects,
          createdAt: tenant.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenantsWithStats,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalTenants / limit),
          totalTenants,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list tenants',
    });
  }
};
