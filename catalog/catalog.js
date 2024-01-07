const express = require("express");
const path = require('path'); 
const sqlite3 = require('sqlite3').verbose();
const d = new sqlite3.Database('../DataBase/DataBase.db');
const app = express();
const port = 7001;
const dbFilePath = path.resolve(__dirname, '../DataBase/DataBase.db');
const Cache = require('node-cache');

const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the database');
  }
});
const cache = new Cache(); 

app.use(express.json());

const cacheMiddleware = (req, res, next) => {
  const cacheKey = req.url; 
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Data found in cache');
    return res.json({ books: cachedData });
  }

  next();
};


app.get('/search/subject/:topic', cacheMiddleware, (req, res) => {
  const { topic } = req.params;
  const query = 'SELECT title, id FROM books WHERE topic = ?'; 
  db.all(query, [topic], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while querying the database' });
    } else {
      // Store the fetched data in the cache above 
      cache.set(req.url, rows);
      console.log('Data added to cache');
      res.json({ books: rows });
    }
  });
});

app.get('/search/item/:id', cacheMiddleware, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM books WHERE id = ?';
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while querying the database' });
    } else {
      cache.set(req.url, rows);
      console.log('Data added to cache');
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
      const cacheKeys = Object.keys(cache.data);
      const cacheKeyPrefix = `/search/item/${id}`; 
      const relatedCacheKeys = cacheKeys.filter(key => key.startsWith(cacheKeyPrefix));

      relatedCacheKeys.forEach(key => cache.del(key));

      res.json({ message: 'Stock updated successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Catalog server is running on port ${port}`);
});
