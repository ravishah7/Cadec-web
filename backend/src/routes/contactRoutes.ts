// backend/src/routes/contactRoutes.ts
import express from 'express';
import { submitContact, getContacts, getContact, markResolved, deleteContact } from '../controllers/contactController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', submitContact);

export default router;
