// volunteerTasks.js
import express from 'express';
import {
  assignTask,
  getMyTasks
} from '../controllers/volunteerTaskController.js';
import auth from '../middleware/auth.js';

const router = express.Router(); 


// ✅ Admin assigns a task
router.post('/assign', auth, assignTask);

// ✅ Volunteer gets their tasks
router.get('/my-tasks', auth, getMyTasks);

export default router;
