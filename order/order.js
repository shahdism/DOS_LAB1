const express = require('express');
const axios = require('axios');
const app = express();
const port = 8001;

app.use(express.json());

app.post('/purchase/:item_number', async (req, res) => {
  const { item_number } = req.params;

  try {
    const catalogResponse = await axios.get(`http://localhost:7001/search/item/${item_number}`);
    console.log('Catalog server response:', catalogResponse.data);

    const item = catalogResponse.data.books[0];

    if (!item || item.stockItems === 0) {
      // Item not found or out of stock 
      return res.status(404).json({ error: 'Item not available or out of stock' });
    }

    // Update stock 
    const updatedStock = item.stockItems - 1;
    const updateStockResponse = await axios.put(`http://localhost:7001/updateStock/${item_number}`, {
      stockItems: updatedStock,
    });

    console.log('Catalog server response after update:', updateStockResponse.data);

    res.json({ message: 'Purchase successful' });
  } catch (error) {
    console.error('Error during purchase:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Order server is running on port ${port}`);
});
