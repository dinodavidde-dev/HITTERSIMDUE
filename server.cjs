const express = require('express');
const path = require('path');

const app = express();
// Fallback to 3000 if PORT is not defined locally
const port = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing by returning index.html for all non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${port}`);
});

