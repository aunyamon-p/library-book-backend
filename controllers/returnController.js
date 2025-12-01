import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// NOTE: ใช้ชื่อตาราง ReturnRecord เพื่อไม่ชนคำสงวน RETURN ของ SQL Server
// ถ้าฐานข้อมูลใช้ชื่อตารางอื่น เปลี่ยนชื่อใน query ให้ตรง (เช่น [Return])

// GET /returns
export const getReturns = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM ReturnRecord ORDER BY return_id');
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
      .query(`INSERT INTO ReturnRecord (return_date, totalfine, processed_id)
              VALUES (@return_date, @totalfine, @processed_id);
              SELECT * FROM ReturnRecord WHERE return_id = SCOPE_IDENTITY()`);
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
      .query(`UPDATE ReturnRecord SET return_date=@return_date, totalfine=@totalfine, processed_id=@processed_id
              WHERE return_id=@id;
              SELECT * FROM ReturnRecord WHERE return_id=@id`);
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
      .query('DELETE FROM ReturnRecord WHERE return_id=@id');

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
