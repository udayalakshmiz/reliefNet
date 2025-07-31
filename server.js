import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoute.js';
import requestRoutes from './routes/requests.js';
import contactRoutes from './routes/contactRoute.js';
import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import volunteerTaskRoutes from './routes/volunteerTasks.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();
const app = express();

// 🔁 For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// 🧩 Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 API Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tasks', volunteerTaskRoutes);
app.use('/api/analytics', analyticsRoutes);

// 🧭 Catch-all route to serve index.html for all unmatched routes (for static site behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
