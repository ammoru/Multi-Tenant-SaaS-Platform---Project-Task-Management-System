import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null, // super_admin has tenantId = null
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ['super_admin', 'tenant_admin', 'user'],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES (CRITICAL)
========================= */

// Email must be unique PER tenant (NOT global)
UserSchema.index(
  { tenantId: 1, email: 1 },
  { unique: true }
);

export default mongoose.model('User', UserSchema);
