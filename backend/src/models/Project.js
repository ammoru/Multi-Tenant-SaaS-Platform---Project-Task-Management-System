import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

// Fast tenant-scoped queries
ProjectSchema.index({ tenantId: 1 });

export default mongoose.model('Project', ProjectSchema);
