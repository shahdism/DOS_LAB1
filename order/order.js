const express = require('express');
const axios = require('axios');
const app = express();
const port = 8002;
const Cache = require('node-cache');

const cache = new Cache(); 
app.use(express.json());

const cacheMiddleware = async (req, res, next) => {
  const { item_number } = req.params;
  const cacheKey = `item_${item_number}`;
  const cachedItem = cache.get(cacheKey);

  if (cachedItem) {
    console.log('Item found in cache');
    return res.json({ item: cachedItem });
  }

  try {
    const catalogResponse = await axios.get(`http://localhost:7001/search/item/${item_number}`);
    console.log('Catalog server response:', catalogResponse.data);

    const item = catalogResponse.data.books[0];

    if (!item || item.stockItems === 0) {
      return res.status(404).json({ error: 'Item not available or out of stock' });
    }

    const updatedStock = item.stockItems - 1;
    await axios.put(`http://localhost:7001/updateStock/${item_number}`, {
      stockItems: updatedStock,
    });

    cache.set(cacheKey, item);
    console.log('Catalog server response after update:', item);
    res.json({ item });
  } catch (error) {
    console.error('Error during purchase:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

app.post('/purchase/:item_number', cacheMiddleware);

app.listen(port, () => {
  console.log(`Order server is running on port ${port}`);
});
