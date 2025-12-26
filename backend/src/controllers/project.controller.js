import Project from '../models/Project.js';
import Tenant from '../models/Tenant.js';
import Task from '../models/Task.js';

/* =====================================================
   CREATE PROJECT
   POST /api/projects
===================================================== */
export const createProject = async (req, res) => {
  try {
    const { name, description = '', status = 'active' } = req.body;
    const tenantId = req.tenantId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    // Check subscription limit
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const projectCount = await Project.countDocuments({ tenantId });
    if (projectCount >= tenant.maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached for your subscription plan',
      });
    }

    const project = await Project.create({
      tenantId,
      name,
      description,
      status,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: project._id,
        tenantId: project.tenantId,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
    });
  }
};

/* =====================================================
   LIST PROJECTS
   GET /api/projects
===================================================== */
export const listProjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = { tenantId };

    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    // Add task counts
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({
          projectId: project._id,
        });
        const completedTaskCount = await Task.countDocuments({
          projectId: project._id,
          status: 'completed',
        });

        return {
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdBy: project.createdBy,
          taskCount,
          completedTaskCount,
          createdAt: project.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        projects: projectsWithStats,
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
      message: 'Failed to list projects',
    });
  }
};

/* =====================================================
   UPDATE PROJECT
   PUT /api/projects/:projectId
===================================================== */
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Tenant isolation
    if (project.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Permission check
    if (
      req.user.role !== 'tenant_admin' &&
      project.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updates,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: updatedProject._id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        updatedAt: updatedProject.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
    });
  }
};

/* =====================================================
   DELETE PROJECT
   DELETE /api/projects/:projectId
===================================================== */
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Tenant isolation
    if (project.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Permission check
    if (
      req.user.role !== 'tenant_admin' &&
      project.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    // Delete tasks first
    await Task.deleteMany({ projectId });

    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};
