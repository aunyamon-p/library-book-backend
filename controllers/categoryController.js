import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /categories
export const getCategories = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Category ORDER BY category_id');
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /categories
export const addCategory = async (req, res) => {
  const { category_name } = req.body;
  try {
    const result = await pool.request()
      .input('category_name', category_name)
      .query(`INSERT INTO Category (category_name)
              VALUES (@category_name);
              SELECT * FROM Category WHERE category_id = SCOPE_IDENTITY()`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add category' });
  }
};

// PUT /categories/:id
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;
  try {
    const result = await pool.request()
      .input('id', id)
      .input('category_name', category_name)
      .query(`UPDATE Category SET category_name=@category_name WHERE category_id=@id;
              SELECT * FROM Category WHERE category_id=@id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update category' });
  }
};

// DELETE /categories/:id
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM Category WHERE category_id=@id');

    const affected = result.rowsAffected?.[0] || 0;
    if (affected === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (err) {
    if (err.number === 547) {
      return res.status(400).json({
        error: 'Cannot delete category because it is referenced by other data',
        detail: err.message,
        code: err.number
      });
    }
    handleError(res, err, { defaultMessage: 'Failed to delete category' });
  }
};
