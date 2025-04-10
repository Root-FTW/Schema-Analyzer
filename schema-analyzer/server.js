const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Endpoint para obtener el contenido HTML de una URL
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Fetching URL: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000, // 15 segundos de timeout
      maxContentLength: 10 * 1024 * 1024, // Limitar a 10MB
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Solo aceptar respuestas exitosas
      }
    });

    console.log(`URL fetched successfully. Content length: ${response.data.length}`);
    res.json({ html: response.data });
  } catch (error) {
    console.error('Error fetching URL:', error);

    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error(`Server responded with status: ${error.response.status}`);
      res.status(error.response.status).json({
        error: 'Failed to fetch URL',
        details: `Server responded with status: ${error.response.status}`
      });
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No response received from server');
      res.status(504).json({
        error: 'Failed to fetch URL',
        details: 'No response received from server'
      });
    } else {
      // Algo sucedió al configurar la solicitud
      console.error(`Error: ${error.message}`);
      res.status(500).json({
        error: 'Failed to fetch URL',
        details: error.message
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
