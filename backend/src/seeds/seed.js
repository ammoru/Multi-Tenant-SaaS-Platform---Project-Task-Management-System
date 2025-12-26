import mongoose from 'mongoose';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';

import { hashPassword } from '../utils/password.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Running seed script...');

    /* =========================
       CLEAN EXISTING DATA
    ========================= */

    await AuditLog.deleteMany();
    await Task.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();
    await Tenant.deleteMany();

    /* =========================
       SUPER ADMIN
    ========================= */

    const superAdminPassword = await hashPassword('Admin@123');

    const superAdmin = await User.create({
      email: 'superadmin@system.com',
      passwordHash: superAdminPassword,
      fullName: 'System Super Admin',
      role: 'super_admin',
      tenantId: null,
    });

    console.log('✅ Super Admin created');

    /* =========================
       DEMO TENANT
    ========================= */

    const demoTenant = await Tenant.create({
      name: 'Demo Company',
      subdomain: 'demo',
      status: 'active',
      subscriptionPlan: 'pro',
      maxUsers: 25,
      maxProjects: 15,
    });

    console.log('✅ Demo Tenant created');

    /* =========================
       TENANT ADMIN
    ========================= */

    const tenantAdminPassword = await hashPassword('Demo@123');

    const tenantAdmin = await User.create({
      tenantId: demoTenant._id,
      email: 'admin@demo.com',
      passwordHash: tenantAdminPassword,
      fullName: 'Demo Admin',
      role: 'tenant_admin',
    });

    console.log('✅ Tenant Admin created');

    /* =========================
       REGULAR USER
    ========================= */

    const userPassword = await hashPassword('User@123');

    const regularUser = await User.create({
      tenantId: demoTenant._id,
      email: 'user1@demo.com',
      passwordHash: userPassword,
      fullName: 'Demo User',
      role: 'user',
    });

    console.log('✅ Regular User created');

    /* =========================
       PROJECT
    ========================= */

    const project = await Project.create({
      tenantId: demoTenant._id,
      name: 'Project Alpha',
      description: 'Demo project for evaluation',
      status: 'active',
      createdBy: tenantAdmin._id,
    });

    console.log('✅ Project created');

    /* =========================
       TASK
    ========================= */

    await Task.create({
      tenantId: demoTenant._id,
      projectId: project._id,
      title: 'Initial Setup Task',
      description: 'This is a seeded task',
      status: 'todo',
      priority: 'high',
      assignedTo: regularUser._id,
    });

    console.log('✅ Task created');

    console.log('🎉 Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
