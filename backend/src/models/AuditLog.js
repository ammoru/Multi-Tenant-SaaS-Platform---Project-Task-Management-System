import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null, // super_admin actions may not have tenant
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

// Fast audit queries per tenant
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);
