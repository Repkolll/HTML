const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API URL for frontend scripts (Railway env var)
const apiBaseUrl = (process.env.API_BASE_URL || 'https://localhost:44389').replace(/\/+$/, '');

// Runtime config endpoint. Frontend loads this before api-config.js
app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`window.__APP_CONFIG__ = { API_BASE_URL: ${JSON.stringify(apiBaseUrl)} };`);
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server started on port ${PORT}`);
    console.log(`API_BASE_URL: ${apiBaseUrl}`);
});

