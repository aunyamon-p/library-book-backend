import express from 'express';
import {
  getAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getAdmins);
router.post('/', authenticateJWT, addAdmin);
router.put('/:id', authenticateJWT, updateAdmin);
router.delete('/:id', authenticateJWT, deleteAdmin);

export default router;
