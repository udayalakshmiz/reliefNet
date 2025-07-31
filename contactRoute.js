import express from 'express';
import { submitContactForm, getAllMessages } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContactForm);          // Submit contact form
router.get('/', getAllMessages);              // View all messages

export default router;
