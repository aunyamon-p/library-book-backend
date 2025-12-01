import express from 'express';
import {
  getMembers,
  addMember,
  updateMember,
  deleteMember
} from '../controllers/memberController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getMembers);
router.post('/', authenticateJWT, addMember);
router.put('/:id', authenticateJWT, updateMember);
router.delete('/:id', authenticateJWT, deleteMember);

export default router;
