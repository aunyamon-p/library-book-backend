import pool from '../db/sqlServer.js';

// GET all books
export const getBooks = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Book');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST add book
export const addBook = async (req, res) => {
  const { isbn, book_name, author, publisher, publish_year, shelf, amount, status, category_id } = req.body;
  try {
    await pool.request()
      .input('isbn', isbn)
      .input('book_name', book_name)
      .input('author', author)
      .input('publisher', publisher)
      .input('publish_year', publish_year)
      .input('shelf', shelf)
      .input('amount', amount)
      .input('status', status)
      .input('category_id', category_id)
      .query(`INSERT INTO Book (isbn, book_name, author, publisher, publish_year, shelf, amount, status, category_id)
              VALUES (@isbn,@book_name,@author,@publisher,@publish_year,@shelf,@amount,@status,@category_id)`);
    res.json({ message: 'Book added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT update book
export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { isbn, book_name, author, publisher, publish_year, shelf, amount, status, category_id } = req.body;
  try {
    await pool.request()
      .input('id', id)
      .input('isbn', isbn)
      .input('book_name', book_name)
      .input('author', author)
      .input('publisher', publisher)
      .input('publish_year', publish_year)
      .input('shelf', shelf)
      .input('amount', amount)
      .input('status', status)
      .input('category_id', category_id)
      .query(`UPDATE Book SET isbn=@isbn, book_name=@book_name, author=@author,
              publisher=@publisher, publish_year=@publish_year, shelf=@shelf,
              amount=@amount, status=@status, category_id=@category_id WHERE book_id=@id`);
    res.json({ message: 'Book updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE book
export const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request()
      .input('id', id)
      .query('DELETE FROM Book WHERE book_id=@id');
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
