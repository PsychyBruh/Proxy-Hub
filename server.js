const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded logos

// File paths
const proxyFile = path.join(__dirname, 'data', 'proxies.json');
const usageFile = path.join(__dirname, 'data', 'usage.json');
const usersFile = path.join(__dirname, 'data', 'users.json');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper: Read/write proxies
const readProxies = () => JSON.parse(fs.readFileSync(proxyFile, 'utf8'));
const writeProxies = (data) => fs.writeFileSync(proxyFile, JSON.stringify(data, null, 2));

// Helper: Read/write usage
const readUsage = () => {
  if (!fs.existsSync(usageFile)) {
    fs.writeFileSync(usageFile, JSON.stringify({})); // Create an empty usage file if it doesn't exist
  }
  return JSON.parse(fs.readFileSync(usageFile, 'utf8'));
};
const writeUsage = (data) => fs.writeFileSync(usageFile, JSON.stringify(data, null, 2));

// Helper: Read/write users
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
};
const writeUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// Serve main page
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
  const newUser = {
    username,
    password: hashedPassword,
    recentProxies: [] // For future personalized features
  };

  users.push(newUser);
  writeUsers(users);

  res.json({ success: true, message: 'User registered' });
});

// 🔐 Login route (direct password comparison with .env)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username is 'admin' and if password matches the one in the .env file
  if (username !== 'admin' || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // If credentials are valid, generate a JWT token
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

  // Initialize usage count for new proxy
  const usage = readUsage();
  usage[name] = 0;
  writeUsage(usage);

  res.json({ success: true, proxy: newProxy });
});

// ❌ Delete proxy (admin only)
app.delete('/api/proxies', verifyToken, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Proxy name is required' });
  }

  const proxies = readProxies().filter(p => p.name !== name);
  writeProxies(proxies);

  const usage = readUsage();
  delete usage[name];
  writeUsage(usage);

  res.json({ success: true });
});

// 🚀 Track proxy launch
app.post('/api/launch', (req, res) => {
  const { name } = req.body;
  const usage = readUsage();
  if (usage[name] !== undefined) {
    usage[name]++;
    writeUsage(usage);
  }
  res.json({ success: true });
});

// 📊 Get usage stats
app.get('/api/usage-stats', (req, res) => {
  const usage = readUsage();
  res.json(usage);  // Send back the usage stats
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
