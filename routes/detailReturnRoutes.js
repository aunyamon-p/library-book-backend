import express from 'express';
import {
  getReturnDetails,
  addReturnDetail,
  updateReturnDetail,
  deleteReturnDetail
} from '../controllers/detailReturnController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getReturnDetails);
router.post('/', authenticateJWT, addReturnDetail);
router.put('/:id', authenticateJWT, updateReturnDetail);
router.delete('/', authenticateJWT, deleteReturnDetail);
router.delete('/:id', authenticateJWT, deleteReturnDetail);

export default router;
