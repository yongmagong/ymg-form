import LoginClient from './LoginClient';

const requiredEnv = [
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'ADMIN_ALLOWED_EMAILS',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

export default function LoginPage() {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  return <LoginClient configured={missing.length === 0} missing={missing} />;
}
