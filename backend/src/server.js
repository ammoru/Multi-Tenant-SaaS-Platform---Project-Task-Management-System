import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* =========================
   DATABASE CONNECTION
========================= */

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/* =========================
   START SERVER
========================= */

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
};

startServer();
