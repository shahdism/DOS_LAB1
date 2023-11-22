const express = require("express");
const path = require('path'); 
const sqlite3 = require('sqlite3').verbose();
const d = new sqlite3.Database('../DataBase/DataBase.db');
const app = express();
const port = 7001;
const dbFilePath = path.resolve(__dirname, '../DataBase/DataBase.db');
const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the database');
  }
});

app.use(express.json());


app.get('/search/subject/:topic', (req, res) => {
  const { topic } = req.params;
  const query = 'SELECT title, id FROM books WHERE topic = ?'; //  only the title and itemnumber
  db.all(query, [topic], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while querying the database' });
    } else {
      res.json({ books: rows });
    }
  });
});

app.get('/search/item/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM books WHERE id = ?';
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while querying the database' });
    } else {
      res.json({ books: rows });
    }
  });
});


app.put('/updateStock/:id', (req, res) => {
  const { id } = req.params;
  const { stockItems } = req.body;

  if (!stockItems || isNaN(stockItems)) {
    return res.status(400).json({ error: 'Invalid stockItems value' });
  }

  const updateQuery = 'UPDATE books SET stockItems = ? WHERE id = ?';
  db.run(updateQuery, [stockItems, id], function (err) {
    if (err) {
      res.status(500).json({ error: 'An error occurred while updating stock' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json({ message: 'Stock updated successfully' });
    }
  });
});


app.listen(port, () => {
  console.log(`Catalog server is running on port ${port}`);
});
