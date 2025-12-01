import pool from '../db/sqlServer.js';
import { handleError } from '../utils/error.js';

// GET /admin
export const getAdmins = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Admin');
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err);
  }
};

// POST /admin
export const addAdmin = async (req, res) => {
  const { username, password, first_name, last_name, name } = req.body;
  try {
    const result = await pool.request()
      .input('username', username)
      .input('password', password)
      .input('first_name', first_name)
      .input('last_name', last_name)
      .input('name', name)
      .query(`INSERT INTO Admin (username,password,first_name,last_name,name)
              VALUES (@username,@password,@first_name,@last_name,@name);
              SELECT * FROM Admin WHERE admin_id = SCOPE_IDENTITY()`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to add admin' });
  }
};

// PUT /admin/:id
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, password, first_name, last_name, name } = req.body;
  try {
    const result = await pool.request()
      .input('id', id)
      .input('username', username)
      .input('password', password)
      .input('first_name', first_name)
      .input('last_name', last_name)
      .input('name', name)
      .query(`UPDATE Admin SET username=@username, password=@password, first_name=@first_name,
              last_name=@last_name, name=@name
              WHERE admin_id=@id;
              SELECT * FROM Admin WHERE admin_id=@id`);
    res.json(result.recordset[0]);
  } catch (err) {
    handleError(res, err, { defaultMessage: 'Failed to update admin' });
  }
};

// DELETE /admin/:id
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM Admin WHERE admin_id=@id');

    const affected = result.rowsAffected?.[0] || 0;
    if (affected === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted' });
  } catch (err) {
    if (err.number === 547) {
      return res.status(400).json({
        error: 'Cannot delete admin because it is referenced by other data',
        detail: err.message,
        code: err.number
      });
    }
    handleError(res, err, { defaultMessage: 'Failed to delete admin' });
  }
};
