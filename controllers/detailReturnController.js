import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /return-details
export const getReturnDetails = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        dr.return_id,
        dr.borrow_id,
        dr.book_id,
        dr.return_date,
        dr.fine,
        dr.status,
        r.return_date AS return_header_date,
        r.totalfine,
        r.processed_by,
        pa.name AS processed_by_name,
        b.book_name,
        m.name AS member_name
      FROM DetailReturned dr
      LEFT JOIN Returned r ON dr.return_id = r.return_id
      LEFT JOIN Admin pa ON r.processed_by = pa.admin_id
      LEFT JOIN BorrowRecord br ON dr.borrow_id = br.borrow_id
      LEFT JOIN Member m ON br.user_id = m.user_id
      LEFT JOIN Book b ON dr.book_id = b.book_id
      ORDER BY dr.return_id DESC, dr.book_id
    `);

    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};


// POST /return-details
export const addReturnDetail = async (req, res) => {
  const { return_id, book_id, borrow_id, return_date, status, fine } = req.body;

  try {
    const result = await pool.request()
      .input('return_id', return_id)
      .input('book_id', book_id)
      .input('borrow_id', borrow_id)
      .input('return_date', return_date)
      .input('status', status)
      .input('fine', fine)
      .query(`
        INSERT INTO DetailReturned (return_id,book_id,borrow_id,return_date,status,fine)
        VALUES (@return_id,@book_id,@borrow_id,@return_date,@status,@fine);

        SELECT *
        FROM DetailReturned
        WHERE return_id=@return_id AND book_id=@book_id
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add return detail' });
  }
};


// PUT update return but recalc fine/status ใหม่เสมอ
export const updateReturnDetail = async (req, res) => {
  const { id } = req.params; // return_id
  const { book_id, borrow_id, return_date, status, fine } = req.body;

  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  try {

    const result = await pool.request()
      .input('return_id', id)
      .input('book_id', book_id)
      .input('borrow_id', borrow_id)
      .input('return_date', return_date)
      .input('status', status)
      .input('fine', fine)
      .query(`
        UPDATE DetailReturned
        SET borrow_id=@borrow_id,
            return_date=@return_date,
            status=@status,
            fine=@fine
        WHERE return_id=@return_id AND book_id=@book_id;

        SELECT * FROM DetailReturned WHERE return_id=@return_id AND book_id=@book_id
      `);

    res.json(result.recordset[0]);

    // อัปเดตสถานะในรายการยืมและหนังสือให้เป็นคืนแล้ว
    await pool.request()
      .input('borrow_id', borrow_id)
      .input('book_id', book_id)
      .query(`UPDATE DetailBorrow SET status='returned' WHERE borrow_id=@borrow_id AND book_id=@book_id;
              UPDATE Book SET status='available' WHERE book_id=@book_id;`);

  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update' });
  }
};



// DELETE /return-details/:id
export const deleteReturnDetail = async (req, res) => {
  const { id } = req.params; // return_id
  const { book_id } = req.body;

  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }
  try {
    const result = await pool.request()
      .input('return_id', id)
      .input('book_id', book_id)
      .query('DELETE FROM DetailReturned WHERE return_id=@return_id AND book_id=@book_id');

    const affected = result.rowsAffected?.[0] || 0;
    if (affected === 0) {
      return res.status(404).json({ error: 'Return detail not found' });
    }

    res.json({ message: 'Return detail deleted' });

  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to delete return detail' });
  }
};
