import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// NOTE: ใช้ชื่อตาราง DetailReturned ตามคอลัมน์ที่ให้มา
// ถ้าตารางจริงสะกดต่างออกไป ให้เปลี่ยนชื่อใน query ให้ตรง

// GET /return-details
export const getReturnDetails = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM DetailReturned ORDER BY detail_returned_id');
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /return-details
export const addReturnDetail = async (req, res) => {
  const { return_id, book_id, fine, status } = req.body;
  try {
    const result = await pool.request()
      .input('return_id', return_id)
      .input('book_id', book_id)
      .input('fine', fine)
      .input('status', status)
      .query(`INSERT INTO DetailReturned (return_id, book_id, fine, status)
              VALUES (@return_id, @book_id, @fine, @status);
              SELECT * FROM DetailReturned WHERE detail_returned_id = SCOPE_IDENTITY()`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add return detail' });
  }
};

// PUT /return-details/:id
export const updateReturnDetail = async (req, res) => {
  const { id } = req.params;
  const { return_id, book_id, fine, status } = req.body;
  try {
    const result = await pool.request()
      .input('id', id)
      .input('return_id', return_id)
      .input('book_id', book_id)
      .input('fine', fine)
      .input('status', status)
      .query(`UPDATE DetailReturned
              SET return_id=@return_id, book_id=@book_id, fine=@fine, status=@status
              WHERE detail_returned_id=@id;
              SELECT * FROM DetailReturned WHERE detail_returned_id=@id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update return detail' });
  }
};

// DELETE /return-details/:id
export const deleteReturnDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM DetailReturned WHERE detail_returned_id=@id');

    const affected = result.rowsAffected?.[0] || 0;
    if (affected === 0) {
      return res.status(404).json({ error: 'Return detail not found' });
    }

    res.json({ message: 'Return detail deleted' });
  } catch (err) {
    if (err.number === 547) {
      return res.status(400).json({
        error: 'Cannot delete return detail because it is referenced by other data',
        detail: err.message,
        code: err.number
      });
    }
    handleError(res, err, { defaultMessage: 'Failed to delete return detail' });
  }
};
