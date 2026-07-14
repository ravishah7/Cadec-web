// backend/src/routes/contactRoutes.ts
import express from 'express';
import { submitContact,} from '../controllers/contactController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', submitContact);

export default router;
