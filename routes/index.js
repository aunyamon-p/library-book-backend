import express from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import memberRoutes from './memberRoutes.js';
import adminRoutes from './adminRoutes.js';
import borrowRoutes from './borrowRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/members', memberRoutes);
router.use('/admin', adminRoutes);
router.use('/borrow', borrowRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
