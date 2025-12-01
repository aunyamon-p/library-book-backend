import express from 'express';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/books
router.get('/', authenticateJWT, getBooks);

// POST /api/books
router.post('/', authenticateJWT, addBook);

// PUT /api/books/:id
router.put('/:id', authenticateJWT, updateBook);

// DELETE /api/books/:id
router.delete('/:id', authenticateJWT, deleteBook);

export default router;
