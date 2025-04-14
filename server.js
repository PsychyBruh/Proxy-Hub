const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File paths
const proxyFile = path.join(__dirname, 'data', 'proxies.json');
const usageFile = path.join(__dirname, 'data', 'usage.json');
const usersFile = path.join(__dirname, 'data', 'users.json');
const suggestedProxiesFile = path.join(__dirname, 'data', 'suggestedProxies.json'); // New file for suggested proxies

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helpers
const readProxies = () => JSON.parse(fs.readFileSync(proxyFile, 'utf8'));
const writeProxies = (data) => fs.writeFileSync(proxyFile, JSON.stringify(data, null, 2));

const readSuggestedProxies = () => {
  if (!fs.existsSync(suggestedProxiesFile)) {
    fs.writeFileSync(suggestedProxiesFile, JSON.stringify([])); // Initialize if the file doesn't exist
  }
  return JSON.parse(fs.readFileSync(suggestedProxiesFile, 'utf8'));
};
const writeSuggestedProxies = (data) => fs.writeFileSync(suggestedProxiesFile, JSON.stringify(data, null, 2));

const readUsage = () => {
  if (!fs.existsSync(usageFile)) {
    fs.writeFileSync(usageFile, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(usageFile, 'utf8'));
};
const writeUsage = (data) => fs.writeFileSync(usageFile, JSON.stringify(data, null, 2));

const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
};
const writeUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 👤 Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  writeUsers(users);

  res.json({ success: true, message: 'User registered' });
});

// 🔐 Login (checks against .env admin creds)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token });
});

// ✅ JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ success: false, message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// 🌐 Get proxies
app.get('/api/proxies', (req, res) => {
  res.json(readProxies());
});

// ➕ Add proxy (admin only)
app.post('/api/proxies', verifyToken, upload.single('logo'), (req, res) => {
  const { name, url } = req.body;
  const logo = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Name and URL are required' });
  }

  const proxies = readProxies();
  const newProxy = { name, url, logo };
  proxies.push(newProxy);
  writeProxies(proxies);

  const usage = readUsage();
  usage[name] = 0;
  writeUsage(usage);

  res.json({ success: true, proxy: newProxy });
});

// ❌ Delete proxy and logo (admin only)
app.delete('/api/proxies', verifyToken, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Proxy name is required' });

  const proxies = readProxies();
  const proxyToDelete = proxies.find(p => p.name === name);
  if (!proxyToDelete) return res.status(404).json({ success: false, message: 'Proxy not found' });

  // Delete logo file if exists
  if (proxyToDelete.logo) {
    const filePath = path.join(__dirname, proxyToDelete.logo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // Remove proxy and update usage
  const updatedProxies = proxies.filter(p => p.name !== name);
  writeProxies(updatedProxies);

  const usage = readUsage();
  delete usage[name];
  writeUsage(usage);

  res.json({ success: true });
});

// 🚀 Track usage
app.post('/api/launch', (req, res) => {
  const { name } = req.body;
  const usage = readUsage();
  if (usage[name] !== undefined) {
    usage[name]++;
    writeUsage(usage);
  }
  res.json({ success: true });
});

// 📊 Protected usage stats
app.get('/api/usage-stats', verifyToken, (req, res) => {
  const usage = readUsage();
  res.json(usage);
});

// 🌟 Get suggested proxies
app.get('/api/suggested-proxies', verifyToken, (req, res) => {
  const suggestedProxies = readSuggestedProxies();
  res.json(suggestedProxies);
});

// ➕ Add a suggested proxy (user action)
app.post('/api/suggest-proxy', (req, res) => {
  const { name, url, logo } = req.body;

  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Name and URL are required' });
  }

  const suggestedProxies = readSuggestedProxies();
  const newSuggestedProxy = { name, url, logo };
  suggestedProxies.push(newSuggestedProxy);
  writeSuggestedProxies(suggestedProxies);

  res.json({ success: true, message: 'Proxy suggestion submitted' });
});

// ✅ Approve a suggested proxy (admin action)
app.post('/api/approve-proxy', verifyToken, (req, res) => {
  const { name, url, logo } = req.body;

  const suggestedProxies = readSuggestedProxies();
  const proxyIndex = suggestedProxies.findIndex(p => p.name === name);

  if (proxyIndex === -1) return res.status(404).json({ success: false, message: 'Suggested proxy not found' });

  const approvedProxy = suggestedProxies.splice(proxyIndex, 1)[0]; // Remove the suggested proxy from the list
  writeSuggestedProxies(suggestedProxies);

  // Add the approved proxy to the main list
  const proxies = readProxies();
  proxies.push(approvedProxy);
  writeProxies(proxies);

  res.json({ success: true, message: 'Proxy approved and added' });
});

// ❌ Deny a suggested proxy (admin action)
app.delete('/api/deny-proxy', verifyToken, (req, res) => {
  const { name } = req.body;

  const suggestedProxies = readSuggestedProxies();
  const proxyIndex = suggestedProxies.findIndex(p => p.name === name);

  if (proxyIndex === -1) return res.status(404).json({ success: false, message: 'Suggested proxy not found' });

  suggestedProxies.splice(proxyIndex, 1); // Remove the denied proxy from the list
  writeSuggestedProxies(suggestedProxies);

  res.json({ success: true, message: 'Proxy denied' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
