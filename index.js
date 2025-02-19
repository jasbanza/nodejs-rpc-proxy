const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});

app.use(express.json());
app.use(limiter);

// Middleware for checking the secret key
const checkSecretKey = (req, res, next) => {
  const secretKey = req.headers['x-secret-key'];
  if (secretKey === process.env.SHARED_SECRET) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/rpc', checkSecretKey, async (req, res) => {
  try {
    const { method, params, id, jsonrpc } = req.body;
    
    // Assuming the RPC server is at this URL
    const response = await axios.post('http://your-rpc-server.com', {
      jsonrpc: jsonrpc || '2.0',
      method,
      params,
      id: id || Date.now()
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error making RPC call:', error);
    res.status(500).json({ error: 'Failed to proxy RPC request' });
  }
});

app.listen(PORT, () => {
  console.log(`RPC Proxy server running on port ${PORT}`);
});
