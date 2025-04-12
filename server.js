const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded logos

const proxyFile = path.join(__dirname, 'data', 'proxies.json');
const usageFile = path.join(__dirname, 'data', 'usage.json');

// File upload setup with multer
const upload = multer({ dest: 'uploads/' });

// Load proxies
const readProxies = () => {
  return JSON.parse(fs.readFileSync(proxyFile, 'utf8'));
};

const writeProxies = (data) => {
  fs.writeFileSync(proxyFile, JSON.stringify(data, null, 2));
};

// Load usage stats
const readUsage = () => {
  return JSON.parse(fs.readFileSync(usageFile, 'utf8'));
};

const writeUsage = (data) => {
  fs.writeFileSync(usageFile, JSON.stringify(data, null, 2));
};

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Admin login (JWT Authentication)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};

// Get proxies
app.get('/api/proxies', (req, res) => {
  res.json(readProxies());
});

// Get proxy stats (usage data)
app.get('/api/stats', (req, res) => {
  res.json(readUsage());
});

// Add proxy (with logo upload)
app.post('/api/proxies', verifyToken, upload.single('logo'), (req, res) => {
  const { name, url } = req.body;
  const logo = req.file ? `/uploads/${req.file.filename}` : null;
  const proxies = readProxies();
  const newProxy = { name, url, logo };
  proxies.push(newProxy);
  writeProxies(proxies);

  // Initialize usage tracking for new proxy
  const usage = readUsage();
  usage[name] = 0;
  writeUsage(usage);

  res.json({ success: true, proxy: newProxy });
});

// Delete proxy
app.delete('/api/proxies', verifyToken, (req, res) => {
  const { name } = req.body;
  const proxies = readProxies();
  const updated = proxies.filter((p) => p.name !== name);
  writeProxies(updated);

  // Remove usage stats
  const usage = readUsage();
  delete usage[name];
  writeUsage(usage);

  res.json({ success: true });
});

// Track proxy usage (increment the hit count)
app.post('/api/launch', (req, res) => {
  const { name } = req.body;
  const usage = readUsage();
  if (usage[name] !== undefined) {
    usage[name]++;
    writeUsage(usage);
  }
  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
