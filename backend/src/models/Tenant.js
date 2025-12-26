import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'trial'],
      default: 'active',
    },

    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },

    maxUsers: {
      type: Number,
      default: 5, // free plan default
    },

    maxProjects: {
      type: Number,
      default: 3, // free plan default
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

TenantSchema.index({ subdomain: 1 }, { unique: true });

export default mongoose.model('Tenant', TenantSchema);
