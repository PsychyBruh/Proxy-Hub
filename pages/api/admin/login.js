import { withSessionRoute } from '../../../lib/session';
import { serialize } from 'cookie';

export default withSessionRoute(async function loginRoute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { password } = req.body;
  const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
  if (password === ADMIN_PASS) {
    req.session.user = { authenticated: true };
    await req.session.save();
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false });
}); 