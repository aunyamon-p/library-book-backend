import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// NOTE: ใช้ชื่อตาราง [Return] (ครอบด้วย [] เพราะเป็นคำสงวน)
// ถ้าตารางชื่ออื่น เช่น ReturnRecord ให้เปลี่ยนชื่อใน query ให้ตรง

// GET /returns
export const getReturns = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Returned ORDER BY return_id');
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /returns
export const addReturn = async (req, res) => {
  const { return_date, totalfine, processed_id } = req.body;
  try {
    const result = await pool.request()
      .input('return_date', return_date)
      .input('totalfine', totalfine)
      .input('processed_id', processed_id)
      .query(`INSERT INTO [Return] (return_date, totalfine, processed_id)
              VALUES (@return_date, @totalfine, @processed_id);
              SELECT * FROM [Return] WHERE return_id = SCOPE_IDENTITY()`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add return record' });
  }
};

// PUT /returns/:id
export const updateReturn = async (req, res) => {
  const { id } = req.params;
  const { return_date, totalfine, processed_id } = req.body;
  try {
    const result = await pool.request()
      .input('id', id)
      .input('return_date', return_date)
      .input('totalfine', totalfine)
      .input('processed_id', processed_id)
      .query(`UPDATE [Return] SET return_date=@return_date, totalfine=@totalfine, processed_id=@processed_id
              WHERE return_id=@id;
              SELECT * FROM [Return] WHERE return_id=@id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update return record' });
  }
};

// DELETE /returns/:id
export const deleteReturn = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM [Return] WHERE return_id=@id');

    const affected = result.rowsAffected?.[0] || 0;
    if (affected === 0) {
      return res.status(404).json({ error: 'Return record not found' });
    }

    res.json({ message: 'Return record deleted' });
  } catch (err) {
    if (err.number === 547) {
      return res.status(400).json({
        error: 'Cannot delete return record because it is referenced by other data',
        detail: err.message,
        code: err.number
      });
    }
    handleError(res, err, { defaultMessage: 'Failed to delete return record' });
  }
};
