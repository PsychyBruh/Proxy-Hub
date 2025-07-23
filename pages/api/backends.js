import fs from 'fs';
import path from 'path';
import { withSessionRoute } from '../../lib/session';

function loadBackends(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveBackends(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export default withSessionRoute(async function handler(req, res) {
  const { user } = req.session;
  if (!user?.authenticated) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  const file = path.join(process.cwd(), 'backends.json');

  switch (req.method) {
    case 'GET': {
      const data = loadBackends(file);
      return res.status(200).json(data);
    }
    case 'POST': {
      const { name, url, logo } = req.body; // logo path provided
      if (!name || !url) return res.status(400).json({ error: 'name and url required' });
      const data = loadBackends(file);
      if (data.find(b => b.name === name)) return res.status(400).json({ error: 'exists' });
      data.push({ name, url, logo: logo || '/logos/default.png', clicks: 0 });
      saveBackends(file, data);
      return res.status(201).json({ ok: true });
    }
    case 'DELETE': {
      const { name } = req.body;
      const data = loadBackends(file).filter(b => b.name !== name);
      saveBackends(file, data);
      return res.status(200).json({ ok: true });
    }
    default:
      return res.status(405).end();
  }
}); 