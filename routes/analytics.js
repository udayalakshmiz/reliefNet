// routes/analytics.js
import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getDashboardAnalytics);

export default router;
