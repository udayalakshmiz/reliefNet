import express from 'express'
import { registerUser } from '../controllers/userController.js'
import auth from '../middleware/auth.js'
import { getAllVolunteers } from '../controllers/userController.js';

const router = express.Router();

router.get('/', auth, getAllVolunteers);

router.post('/register', registerUser);

export default router;
