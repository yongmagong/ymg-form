import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/authOptions';

// For use in Server Components / route handlers (Node runtime, next/headers cookies())
async function isAuthedServer() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// For use in Server Components that need the current user's identity
async function getServerAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const email = session.user.email || '';
  return {
    name: session.user.name || '',
    email,
    displayName: session.user.name || (email ? email.split('@')[0] : '담당자'),
  };
}

// For use in route handlers that receive a Request object
async function isAuthedRequest(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
}

async function getAuthedRequestUser(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  return {
    name: token.name || '',
    email: token.email || '',
    displayName: token.name || (token.email ? token.email.split('@')[0] : '담당자'),
  };
}

export { isAuthedServer, isAuthedRequest, getAuthedRequestUser, getServerAuthUser };
