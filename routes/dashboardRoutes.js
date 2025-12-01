import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getDashboardStats);

export default router;
