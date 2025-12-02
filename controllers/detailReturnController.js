import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

export const getReturnDetails = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        r.return_id,
        r.totalfine,
        r.processed_by,
        a.name AS processed_by_name,
        dr.borrow_id,
        dr.book_id,
        dr.return_date AS detail_return_date,
        dr.status,
        dr.fine,
        b.book_name,
        m.name AS member_name,
        db.due_date     
      FROM Returned r
      JOIN DetailReturned dr ON r.return_id = dr.return_id
      JOIN BorrowRecord br ON dr.borrow_id = br.borrow_id
      JOIN DetailBorrow db ON dr.borrow_id = db.borrow_id AND dr.book_id = db.book_id 
      JOIN Member m ON br.user_id = m.user_id
      JOIN Book b ON dr.book_id = b.book_id
      LEFT JOIN Admin a ON r.processed_by = a.admin_id
      ORDER BY r.return_id DESC, dr.book_id
    `);
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

export const addReturnDetail = async (req, res) => {
  const { return_id, borrow_id, book_id, return_date, fine, status } = req.body;
  try {
    const result = await pool.request()
      .input('return_id', return_id)
      .input('borrow_id', borrow_id)
      .input('book_id', book_id)
      .input('return_date', return_date)
      .input('fine', fine)
      .input('status', status)
      .query(`INSERT INTO DetailReturned (return_id, borrow_id, book_id, return_date, fine, status)
              VALUES (@return_id, @borrow_id, @book_id, @return_date, @fine, @status);
              SELECT * FROM DetailReturned WHERE return_id=@return_id AND borrow_id=@borrow_id AND book_id=@book_id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add return detail' });
  }
};

export const updateReturnDetail = async (req, res) => {
  const { return_id, borrow_id, book_id, return_date, fine, status } = req.body;
  if (!return_id || !borrow_id || !book_id) {
    return res.status(400).json({ error: 'return_id, borrow_id, and book_id are required to update return detail' });
  }
  try {
    const result = await pool.request()
      .input('return_id', return_id)
      .input('borrow_id', borrow_id)
      .input('book_id', book_id)
      .input('return_date', return_date)
      .input('fine', fine)
      .input('status', status)
      .query(`UPDATE DetailReturned
              SET return_date = @return_date, fine=@fine, status=@status
              WHERE return_id=@return_id AND borrow_id=@borrow_id AND book_id=@book_id;
              SELECT * FROM DetailReturned WHERE return_id=@return_id AND borrow_id=@borrow_id AND book_id=@book_id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update return detail' });
  }
};

export const deleteReturnDetail = async (req, res) => {
  const return_id = req.body.return_id || req.query.return_id;
  const borrow_id = req.body.borrow_id || req.query.borrow_id;
  const book_id = req.body.book_id || req.query.book_id;

  if (!return_id || !borrow_id || !book_id) {
    return res.status(400).json({
      error: 'return_id, borrow_id, and book_id are required to delete return detail'
    });
  }

  try {
    const result = await pool.request()
      .input('return_id', return_id)
      .input('borrow_id', borrow_id)
      .input('book_id', book_id)
      .query('DELETE FROM DetailReturned WHERE return_id=@return_id AND borrow_id=@borrow_id AND book_id=@book_id');

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
