const axios = require('axios');

const serverEndpoints = [
  'http://localhost:8002', // Order server
  'http://localhost:7001', // Catalog server
];
let currentIndex = 0;

const handleRequest = async (req, res) => {
  const currentServer = serverEndpoints[currentIndex];

  try {
    const response = await axios.get(currentServer + req.url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response.data));
    
    currentIndex = (currentIndex + 1) % serverEndpoints.length;
  } catch (error) {
    console.error('Error proxying request:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
};

module.exports = { handleRequest };
