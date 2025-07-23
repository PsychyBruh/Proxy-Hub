import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }
  const file = path.join(process.cwd(), 'backends.json');
  let backends;
  if (!fs.existsSync(file)) {
    backends = [
      {
        name: 'Google',
        url: 'https://www.google.com',
        logo: '/logos/default.png',
        clicks: 0,
      },
    ];
    fs.writeFileSync(file, JSON.stringify(backends, null, 2));
  } else {
    backends = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  const backend = backends.find(b => b.name === name);
  if (!backend) return res.status(404).json({ error: 'not found' });

  backend.clicks = (backend.clicks || 0) + 1;
  fs.writeFileSync(file, JSON.stringify(backends, null, 2));

  res.writeHead(302, { Location: backend.url });
  res.end();
} 