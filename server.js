import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoute.js';
import requestRoutes from './routes/requests.js';
import contactRoutes from './routes/contactRoute.js';
import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import volunteerTaskRoutes from './routes/volunteerTasks.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tasks', volunteerTaskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(express.static('public'));

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
}).then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
}).catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
});


