import pool from '../db/sqlServer.js';

// GET /admin
export const getAdmins = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Admin');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /admin/:id
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request().input('id', id).query('DELETE FROM Admin WHERE admin_id=@id');
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
