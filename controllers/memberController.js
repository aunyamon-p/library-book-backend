import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /members
export const getMembers = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        m.*,
        ISNULL(active.borrowed_count, 0) AS borrowed_count,
        m.borrowlimit - ISNULL(active.borrowed_count, 0) AS borrow_remaining
      FROM Member m
      LEFT JOIN (
        SELECT br.user_id, COUNT(*) AS borrowed_count
        FROM BorrowRecord br
        JOIN DetailBorrow db ON br.borrow_id = db.borrow_id
        WHERE db.status = 'borrowed'
        GROUP BY br.user_id
      ) AS active ON m.user_id = active.user_id
    `);
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /members
export const addMember = async (req, res) => {
  const { name, first_name, last_name, email, phone, borrowlimit, date_registered, status } = req.body;
  try {
    const result = await pool.request()
      .input('name', name)
      .input('first_name', first_name)
      .input('last_name', last_name)
      .input('email', email)
      .input('phone', phone)
      .input('borrowlimit', borrowlimit)
      .input('date_registered', date_registered)
      .input('status', status)
      .query(`INSERT INTO Member (name, first_name, last_name, email, phone, borrowlimit, date_registered, status)
              VALUES (@name,@first_name,@last_name,@email,@phone,@borrowlimit,@date_registered,@status);
              SELECT * FROM Member WHERE user_id = SCOPE_IDENTITY()`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add member' });
  }
};

// PUT /members/:id
export const updateMember = async (req, res) => {
  const { id } = req.params;
  const { name, first_name, last_name, email, phone, borrowlimit, date_registered, status } = req.body;
  try {
    const result = await pool.request()
      .input('id', id)
      .input('name', name)
      .input('first_name', first_name)
      .input('last_name', last_name)
      .input('email', email)
      .input('phone', phone)
      .input('borrowlimit', borrowlimit)
      .input('date_registered', date_registered)
      .input('status', status)
      .query(`UPDATE Member SET name=@name, first_name=@first_name, last_name=@last_name, email=@email,
              phone=@phone, borrowlimit=@borrowlimit, date_registered=@date_registered, status=@status
              WHERE user_id=@id;
              SELECT * FROM Member WHERE user_id=@id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update member' });
  }
};

// DELETE /members/:id
export const deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request().input('id', id).query('DELETE FROM Member WHERE user_id=@id');
    res.json({ message: 'Member deleted' });
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to delete member' });
  }
};
