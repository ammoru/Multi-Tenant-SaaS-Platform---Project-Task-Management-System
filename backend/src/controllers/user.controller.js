import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Task from '../models/Task.js';
import { hashPassword } from '../utils/password.js';

/* =====================================================
   ADD USER TO TENANT
   POST /api/tenants/:tenantId/users
===================================================== */
export const addUser = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, password, fullName, role = 'user' } = req.body;

    // Only tenant_admin of same tenant can add users
    if (req.user.tenantId.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and full name are required',
      });
    }

    // Fetch tenant & check subscription limit
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const currentUserCount = await User.countDocuments({ tenantId });
    if (currentUserCount >= tenant.maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'User limit reached for your subscription plan',
      });
    }

    // Create user
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      tenantId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/* =====================================================
   LIST USERS IN TENANT
   GET /api/tenants/:tenantId/users
===================================================== */
export const listUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { search, role, page = 1, limit = 50 } = req.query;

    if (req.user.tenantId.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    const query = { tenantId };

    if (role) query.role = role;

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        users,
        total,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list users',
    });
  }
};

/* =====================================================
   UPDATE USER
   PUT /api/users/:userId
===================================================== */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure same tenant
    if (
      req.user.role !== 'super_admin' &&
      user.tenantId.toString() !== req.user.tenantId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const updates = {};

    // Self update: only fullName
    if (req.user.userId === userId) {
      if (fullName) updates.fullName = fullName;

      if (role || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'You cannot update these fields',
        });
      }
    }

    // Tenant admin update
    if (req.user.role === 'tenant_admin') {
      if (fullName) updates.fullName = fullName;
      if (role) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

/* =====================================================
   DELETE USER
   DELETE /api/users/:userId
===================================================== */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self delete
    if (req.user.userId === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Tenant check
    if (user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Unassign tasks
    await Task.updateMany(
      { assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
