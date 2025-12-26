import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

/* =====================================================
   CREATE TASK
   POST /api/projects/:projectId/tasks
===================================================== */
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description = '', assignedTo, priority = 'medium', dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Verify project & tenant
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Validate assigned user
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user || user.tenantId.toString() !== req.tenantId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must belong to same tenant',
        });
      }
    }

    const task = await Task.create({
      tenantId: project.tenantId,
      projectId,
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: task._id,
        projectId: task.projectId,
        tenantId: task.tenantId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
    });
  }
};

/* =====================================================
   LIST PROJECT TASKS
   GET /api/projects/:projectId/tasks
===================================================== */
export const listProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    const query = {
      projectId,
      tenantId: req.tenantId,
    };

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (priority) query.priority = priority;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName email')
      .sort({ priority: -1, dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        tasks,
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
      message: 'Failed to list tasks',
    });
  }
};

/* =====================================================
   UPDATE TASK STATUS
   PATCH /api/tasks/:taskId/status
===================================================== */
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      data: {
        id: task._id,
        status: task.status,
        updatedAt: task.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task status',
    });
  }
};

/* =====================================================
   UPDATE TASK (FULL)
   PUT /api/tasks/:taskId
===================================================== */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    // Validate assigned user
    if (assignedTo !== undefined && assignedTo !== null) {
      const user = await User.findById(assignedTo);
      if (!user || user.tenantId.toString() !== req.tenantId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must belong to same tenant',
        });
      }
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updates,
      { new: true }
    ).populate('assignedTo', 'fullName email');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignedTo: updatedTask.assignedTo,
        dueDate: updatedTask.dueDate,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
    });
  }
};

/* =====================================================
   DELETE TASK
   DELETE /api/tasks/:taskId
===================================================== */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access',
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
    });
  }
};
