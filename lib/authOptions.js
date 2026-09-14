import GoogleProvider from 'next-auth/providers/google';
import { STAFF_TAB, getConfigById, upsertConfig } from './sheets';

const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

// Anyone signing in with a Google Workspace account on this domain is
// auto-provisioned into the 관리자_설정 staff roster on first login (no need
// to register each email individually). Staff status (allowed/blocked) is
// then managed from /admin/staff.
const ADMIN_ALLOWED_DOMAIN = (process.env.ADMIN_ALLOWED_DOMAIN || 'yongincommunity.org').toLowerCase();

export const authOptions = {
  providers:
    googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : [],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  callbacks: {
    async signIn({ user, profile }) {
      const email = (user.email || '').toLowerCase();
      if (!email) return false;
      const now = new Date().toISOString();

      const existing = await getConfigById(STAFF_TAB, email);
      if (existing) {
        if (existing.status === 'blocked') return false;
        await upsertConfig(STAFF_TAB, { ...existing, name: user.name || existing.name, lastLoginAt: now });
        return true;
      }

      if (profile?.hd && profile.hd.toLowerCase() === ADMIN_ALLOWED_DOMAIN) {
        await upsertConfig(STAFF_TAB, {
          id: email,
          email,
          name: user.name || '',
          status: 'allowed',
          source: 'domain',
          firstLoginAt: now,
          lastLoginAt: now,
          createdAt: now,
        });
        return true;
      }

      return false;
    },
  },
};
