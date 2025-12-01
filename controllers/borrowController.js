import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /borrow
export const getBorrowRecords = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT db.detail_borrow_id, m.name AS member_name, b.book_name, br.borrow_date, db.due_date, db.status
      FROM BorrowRecord br
      JOIN Member m ON br.user_id = m.user_id
      JOIN DetailBorrow db ON br.borrow_id = db.borrow_id
      JOIN Book b ON db.book_id = b.book_id
    `);
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /borrow
export const addBorrowRecord = async (req, res) => {
  const { user_id, borrow_date, amount, recorded_by, books } = req.body; // books = [{book_id, due_date}]
  try {
    const result = await pool.request()
      .input('user_id', user_id)
      .input('borrow_date', borrow_date)
      .input('amount', amount)
      .input('recorded_by', recorded_by)
      .query(`INSERT INTO BorrowRecord (user_id, borrow_date, amount, recorded_by)
              VALUES (@user_id,@borrow_date,@amount,@recorded_by);
              SELECT SCOPE_IDENTITY() AS borrow_id`);
    const borrow_id = result.recordset[0].borrow_id;

    for (let book of books) {
      await pool.request()
        .input('borrow_id', borrow_id)
        .input('book_id', book.book_id)
        .input('due_date', book.due_date)
        .input('status', 'borrowed')
        .query(`INSERT INTO DetailBorrow (borrow_id, book_id, due_date, status)
                VALUES (@borrow_id,@book_id,@due_date,@status)`);
      // Update book status
      await pool.request()
        .input('book_id', book.book_id)
        .query(`UPDATE Book SET status='borrowed' WHERE book_id=@book_id`);
    }

    res.json({ message: 'Borrow record created', borrow_id });
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to create borrow record' });
  }
};

// PUT /borrow/:id (update status)
export const updateBorrowStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // borrowed / returned
  try {
    const detailResult = await pool.request()
      .input('id', id)
      .query(`UPDATE DetailBorrow SET status=@status WHERE detail_borrow_id=@id;
              SELECT * FROM DetailBorrow WHERE detail_borrow_id=@id`);
    const detail = detailResult.recordset[0];

    if (status === 'returned') {
      // update book status to available
      await pool.request()
        .input('book_id', detail.book_id)
        .query(`UPDATE Book SET status='available' WHERE book_id=@book_id`);
    }

    res.json(detail);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update borrow status' });
  }
};

// DELETE /borrow/:id
export const deleteBorrowRecord = async (req, res) => {
  const { id } = req.params;
  try {
    // optionally update book status back to available if needed
    await pool.request().input('id', id).query('DELETE FROM DetailBorrow WHERE borrow_id=@id; DELETE FROM BorrowRecord WHERE borrow_id=@id;');
    res.json({ message: 'Borrow record deleted' });
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to delete borrow record' });
  }
};
