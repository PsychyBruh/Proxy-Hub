const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load proxies
const proxyFile = path.join(__dirname, 'data', 'proxies.json');

const readProxies = () => {
  return JSON.parse(fs.readFileSync(proxyFile, 'utf8'));
};

const writeProxies = (data) => {
  fs.writeFileSync(proxyFile, JSON.stringify(data, null, 2));
};

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Admin login (simple auth)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Get proxies
app.get('/api/proxies', (req, res) => {
  res.json(readProxies());
});

// Add proxy
app.post('/api/proxies', (req, res) => {
  const { name, url } = req.body;
  const proxies = readProxies();
  proxies.push({ name, url });
  writeProxies(proxies);
  res.json({ success: true });
});

// Delete proxy
app.delete('/api/proxies', (req, res) => {
  const { name } = req.body;
  const proxies = readProxies();
  const updated = proxies.filter((p) => p.name !== name);
  writeProxies(updated);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
