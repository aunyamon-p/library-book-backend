import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /return-details
export const getReturnDetails = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT *
      FROM DetailReturned
      ORDER BY return_id DESC, book_id
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
  const { id } = req.params;
  const { return_id, book_id, borrow_id, return_date, status, fine } = req.body;

  try {

    const result = await pool.request()
      .input('id', id)
      .input('return_id', return_id)
      .input('book_id', book_id)
      .input('borrow_id', borrow_id)
      .input('return_date', return_date)
      .input('status', status)
      .input('fine', fine)
      .query(`
        UPDATE DetailReturned
        SET return_id=@return_id, 
            book_id=@book_id, 
            borrow_id=@borrow_id,
            return_date=@return_date,
            status=@status,
            fine=@fine
        WHERE detail_returned_id=@id;

        SELECT * FROM DetailReturned WHERE detail_returned_id=@id
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update' });
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
    handleError(res, err, { defaultMessage: 'Failed to delete return detail' });
  }
};
