import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await pool.request().query('SELECT COUNT(*) AS total FROM Book');
    const totalMembers = await pool.request().query('SELECT COUNT(*) AS total FROM Member');
    const borrowedBooks = await pool.request().query(`SELECT COUNT(*) AS total FROM Book WHERE status='borrowed'`);
    const overdueBooks = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM DetailBorrow
      WHERE status='borrowed' AND due_date < GETDATE()
    `);

    res.json({
      totalBooks: totalBooks.recordset[0].total,
      totalMembers: totalMembers.recordset[0].total,
      borrowedBooks: borrowedBooks.recordset[0].total,
      overdueBooks: overdueBooks.recordset[0].total
    });
  } catch (err) {
    handleError(res, err);
  }
};
