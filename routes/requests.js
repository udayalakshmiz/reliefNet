import express from 'express';
import {
  createRequest,
  getAllHelpRequests,
  getHelpRequestById,
  updateHelpRequestStatus,
  assignVolunteer,
} from '../controllers/helpRequestController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createRequest);
router.get('/', auth, getAllHelpRequests);
router.get('/:id', auth, getHelpRequestById);
router.put('/:id/status', auth, updateHelpRequestStatus);

// Assign a volunteer to a request
router.post('/:id/assign', auth, assignVolunteer);

// Get assigned tasks for the logged-in volunteer
router.get('/assigned-tasks', auth, async (req, res) => {
  try {
    const volunteerId = req.user.id;

    const tasks = await HelpRequest.find({ assignedVolunteer: volunteerId }).populate('createdBy');

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching assigned tasks:', err);
    res.status(500).json({ error: 'Error retrieving assigned tasks' });
  }
});



export default router;
