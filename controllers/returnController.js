import pool from '../db/sqlServer.js';
import sql from 'mssql';
import { handleError } from '../utils/error.js';

// ใช้ชื่อตาราง Returned และ DetailReturned ตาม schema ที่ให้มา

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
  const { return_date, processed_by, items } = req.body; // items: [{borrow_id, book_id, return_date, fine, status}]
  try {
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // ถ้ามี items ให้คำนวณ totalfine จากรายการ
    const computedFine = Array.isArray(items)
      ? items.reduce((sum, it) => sum + Number(it.fine || 0), 0)
      : 0;

    const insertReturn = await new sql.Request(transaction)
      .input('return_date', return_date)
      .input('totalfine', computedFine)
      .input('processed_by', processed_by)
      .query(`INSERT INTO Returned (return_date, totalfine, processed_by)
              VALUES (@return_date, @totalfine, @processed_by);
              SELECT SCOPE_IDENTITY() AS return_id;`);

    const return_id = insertReturn.recordset[0].return_id;

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await new sql.Request(transaction)
          .input('return_id', return_id)
          .input('borrow_id', item.borrow_id)
          .input('book_id', item.book_id)
          .input('return_date', item.return_date || return_date)
          .input('fine', item.fine)
          .input('status', item.status)
          .query(`INSERT INTO DetailReturned (return_id, borrow_id, book_id, return_date, fine, status)
                  VALUES (@return_id, @borrow_id, @book_id, @return_date, @fine, @status)`);

        // อัปเดตสถานะรายการยืมและหนังสือให้เป็นคืนแล้ว
        await new sql.Request(transaction)
          .input('borrow_id', item.borrow_id)
          .input('book_id', item.book_id)
          .query(`UPDATE DetailBorrow SET status='returned' WHERE borrow_id=@borrow_id AND book_id=@book_id;
                  UPDATE Book SET status='available' WHERE book_id=@book_id;`);
      }
    }

    await transaction.commit();

    const created = await pool.request()
      .input('return_id', return_id)
      .query('SELECT * FROM Returned WHERE return_id=@return_id');

    res.json({
      ...created.recordset[0],
      items: items || []
    });
  } catch (err) {
    if (err?.transaction) {
      try { await err.transaction.rollback(); } catch (_) { /* ignore rollback error */ }
    }
    handleError(res, err, { defaultMessage: 'Failed to add return record' });
  }
};

// PUT /returns/:id
export const updateReturn = async (req, res) => {
  const { id } = req.params;
  const { return_date, totalfine, processed_by } = req.body;
  try {
    const result = await pool.request()
      .input('id', id)
      .input('return_date', return_date)
      .input('totalfine', totalfine)
      .input('processed_by', processed_by)
      .query(`UPDATE Returned SET return_date=@return_date, totalfine=@totalfine, processed_by=@processed_by
              WHERE return_id=@id;
              SELECT * FROM Returned WHERE return_id=@id`);
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
      .query('DELETE FROM Returned WHERE return_id=@id');

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
