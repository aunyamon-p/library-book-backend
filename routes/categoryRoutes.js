import express from 'express';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getCategories);
router.post('/', authenticateJWT, addCategory);
router.put('/:id', authenticateJWT, updateCategory);
router.delete('/:id', authenticateJWT, deleteCategory);

export default router;
