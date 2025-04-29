const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const ejsLocals = require('ejs-locals');
require('dotenv').config(); // For loading environment variables from .env file

const APP_PORT = process.env.APP_PORT || 8081;
const ADMIN_PASS = process.env.ADMIN_PASS; // Loaded from .env

const BACKENDS_FILE = path.join(__dirname, 'backends.json');
let backends = [];

// Load or initialize backends.json
if (fs.existsSync(BACKENDS_FILE)) {
  backends = JSON.parse(fs.readFileSync(BACKENDS_FILE));
} else {
  backends = [
    { name: 'void',      target: 'http://localhost:7070', prefix: '/void' },
    { name: 'emerald',   target: 'http://localhost:5613', prefix: '/emerald' },
    { name: 'purplocity',target: 'http://localhost:8080', prefix: '/purplocity' },
  ];
  fs.writeFileSync(BACKENDS_FILE, JSON.stringify(backends, null, 2));
}

const app = express();

// View engine & static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Register ejs-locals to enable layout support
app.engine('ejs', ejsLocals);

app.use('/public', express.static(path.join(__dirname, 'public')));

// Body & session for admin
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'a very secret key',
  resave: false,
  saveUninitialized: false,
}));

// Middleware: mount proxy routes dynamically
function mountProxies() {
  // clear any existing proxy mounts
  backends.forEach(b => {
    app.use(
      b.prefix,
      createProxyMiddleware({
        target: b.target,
        changeOrigin: true,
        pathRewrite: (pathReq) => pathReq.replace(new RegExp(`^${b.prefix}`), ''),
      })
    );
  });
}
mountProxies();

// --- Public hub page ---
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home',   // Title set dynamically here
    backends
  });
});

// --- Admin auth ---
app.get('/admin/login', (req, res) => {
  res.render('admin', { 
    title: 'Admin Login',   // Title set dynamically here
    error: null, 
    backends, 
    loggedIn: !!req.session.admin 
  });
});
app.post('/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    req.session.admin = true;
    return res.redirect('/admin');
  }
  res.render('admin', { 
    title: 'Admin Login',   // Title set dynamically here
    error: 'Invalid password', 
    backends, 
    loggedIn: false 
  });
});
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => { res.redirect('/'); });
});

// --- Admin panel: add & remove ---
app.get('/admin', (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');
    res.render('admin', {
      title: 'Admin Panel',
      error: null,
      backends,
      loggedIn: true
    });
});
app.post('/admin/add', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');
  const { name, target, prefix } = req.body;
  backends.push({ name, target, prefix });
  fs.writeFileSync(BACKENDS_FILE, JSON.stringify(backends, null, 2));
  mountProxies();
  res.redirect('/admin');
});
app.post('/admin/remove', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');
  const { name } = req.body;
  backends = backends.filter(b => b.name !== name);
  fs.writeFileSync(BACKENDS_FILE, JSON.stringify(backends, null, 2));
  res.redirect('/admin');
});

// Start the server
app.listen(APP_PORT, () => {
  console.log(`Proxy hub listening on http://localhost:${APP_PORT}`);
});
