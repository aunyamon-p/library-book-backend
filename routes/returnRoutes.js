import express from 'express';
import {
  getReturns,
  addReturn,
  updateReturn,
  deleteReturn
} from '../controllers/returnController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getReturns);
router.post('/', authenticateJWT, addReturn);
router.put('/:id', authenticateJWT, updateReturn);
router.delete('/:id', authenticateJWT, deleteReturn);

export default router;
