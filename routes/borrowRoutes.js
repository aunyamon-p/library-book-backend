import express from 'express';
import {
  getBorrowRecords,
  addBorrowRecord,
  updateBorrowStatus,
  deleteBorrowRecord
} from '../controllers/borrowController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getBorrowRecords);
router.post('/', authenticateJWT, addBorrowRecord);
router.put('/:id', authenticateJWT, updateBorrowStatus);
router.delete('/:id', authenticateJWT, deleteBorrowRecord);

export default router;
