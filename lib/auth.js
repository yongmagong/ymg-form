import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'ymc_admin_session';

function getSecret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret';
}

function signToken() {
  return crypto.createHmac('sha256', getSecret()).update('ymc-admin-ok').digest('hex');
}

function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isAuthedFromCookieValue(value) {
  if (!value) return false;
  const expected = signToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// For use in Server Components / route handlers (Node runtime, next/headers cookies())
async function isAuthedServer() {
  const store = await cookies();
  return isAuthedFromCookieValue(store.get(COOKIE_NAME)?.value);
}

// For use in route handlers that receive a Request object
function isAuthedRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  const value = decodeURIComponent(match.split('=').slice(1).join('='));
  return isAuthedFromCookieValue(value);
}

export { COOKIE_NAME, signToken, checkPassword, isAuthedServer, isAuthedRequest };
