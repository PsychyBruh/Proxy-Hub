const fs = require('fs');
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const ejsLocals = require('ejs-locals');

const APP_PORT = 8081;
const ADMIN_PASS = process.env.ADMIN_PASS;

const BACKENDS_FILE = path.join(__dirname, 'backends.json');
let backends = [];

// Load or initialize backends.json
if (fs.existsSync(BACKENDS_FILE)) {
  backends = JSON.parse(fs.readFileSync(BACKENDS_FILE));
} else {
  backends = [
    { name: 'void', target: 'https://example.com', logo: '/public/logo.png' },
    { name: 'emerald', target: 'https://google.com', logo: '/public/logo.png' },
  ];
  fs.writeFileSync(BACKENDS_FILE, JSON.stringify(backends, null, 2));
}

const app = express();

// File upload setup
const uploadDir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsLocals);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'a very secret key',
  resave: false,
  saveUninitialized: false,
}));

// --- Public hub page ---
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    backends
  });
});

// --- Admin routes ---
app.get('/admin/login', (req, res) => {
  res.render('admin', {
    title: 'Admin Login',
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
    title: 'Admin Login',
    error: 'Invalid password',
    backends,
    loggedIn: false
  });
});
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => { res.redirect('/'); });
});

app.get('/admin', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  res.render('admin', {
    title: 'Admin Panel',
    error: null,
    backends,
    loggedIn: true
  });
});

// Add & remove backends (with logo upload)
app.post('/admin/add', upload.single('logo'), (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');
  const { name, target } = req.body;
  const logo = req.file ? `/public/logos/${req.file.filename}` : '/public/logo.png';
  backends.push({ name, target, logo });
  fs.writeFileSync(BACKENDS_FILE, JSON.stringify(backends, null, 2));
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
