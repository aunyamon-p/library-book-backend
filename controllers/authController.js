import pool from '../db/sqlServer.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.request()
      .input('username', username)
      .input('password', password)
      .query('SELECT * FROM Admin WHERE username = @username AND password = @password');

    if (result.recordset.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.recordset[0];
    const token = jwt.sign({ admin_id: user.admin_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
