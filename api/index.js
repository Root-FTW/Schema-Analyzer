const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Creamos una instancia de Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para obtener el contenido HTML de una URL
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    res.json({ html: response.data });
  } catch (error) {
    console.error('Error fetching URL:', error.message);
    res.status(500).json({ error: 'Failed to fetch URL', details: error.message });
  }
});

// Endpoint de prueba para verificar que la API está funcionando
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Exportamos la aplicación Express como una función serverless para Vercel
module.exports = app;
