import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

/* =====================================================
   REGISTER TENANT
   POST /api/auth/register-tenant
===================================================== */
export const registerTenant = async (req, res) => {
  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName,
    } = req.body;

    // Basic validation
    if (
      !tenantName ||
      !subdomain ||
      !adminEmail ||
      !adminPassword ||
      !adminFullName
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check subdomain uniqueness
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword);

    // Create tenant (default: free plan)
    const tenant = await Tenant.create({
      name: tenantName,
      subdomain,
      subscriptionPlan: 'free',
      maxUsers: 5,
      maxProjects: 3,
    });

    // Create tenant admin
    const adminUser = await User.create({
      tenantId: tenant._id,
      email: adminEmail,
      passwordHash: hashedPassword,
      fullName: adminFullName,
      role: 'tenant_admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenant._id,
        subdomain: tenant.subdomain,
        adminUser: {
          id: adminUser._id,
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: adminUser.role,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Tenant registration failed',
    });
  }
};

/* =====================================================
   LOGIN
   POST /api/auth/login
===================================================== */
export const login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    if (!email || !password || !tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and tenant subdomain are required',
      });
    }

    // Find tenant
    const tenant = await Tenant.findOne({ subdomain: tenantSubdomain });

    if (!tenant || tenant.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found or inactive',
      });
    }

    // Find user inside tenant
    const user = await User.findOne({
      email,
      tenantId: tenant._id,
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT
    const token = signToken({
      userId: user._id,
      tenantId: user.tenantId,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          tenantId: user.tenantId,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/* =====================================================
   GET CURRENT USER
   GET /api/auth/me
===================================================== */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-passwordHash')
      .populate('tenantId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        tenant: user.tenantId
          ? {
              id: user.tenantId._id,
              name: user.tenantId.name,
              subdomain: user.tenantId.subdomain,
              subscriptionPlan: user.tenantId.subscriptionPlan,
              maxUsers: user.tenantId.maxUsers,
              maxProjects: user.tenantId.maxProjects,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

/* =====================================================
   LOGOUT
   POST /api/auth/logout
===================================================== */
export const logout = async (req, res) => {
  // JWT is stateless → client deletes token
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
