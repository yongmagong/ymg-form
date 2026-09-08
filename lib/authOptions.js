import GoogleProvider from 'next-auth/providers/google';

const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

function allowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Anyone signing in with a Google Workspace account on this domain is
// allowed automatically (no need to register each email individually).
// ADMIN_ALLOWED_EMAILS still works on top of this for anyone outside the
// domain (e.g. an external collaborator on a personal Gmail account).
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
      if (profile?.hd && profile.hd.toLowerCase() === ADMIN_ALLOWED_DOMAIN) return true;
      return allowedEmails().includes(email);
    },
  },
};
