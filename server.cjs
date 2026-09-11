const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing by returning index.html for all non-API requests
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
