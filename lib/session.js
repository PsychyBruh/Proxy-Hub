import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters',
  cookieName: 'proxyhub_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export function withSessionRoute(handler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr(handler) {
  return withIronSessionSsr(handler, sessionOptions);
} 