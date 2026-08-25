import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAuthedServer } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function AdminLayout({ children }) {
  const authed = await isAuthedServer();
  if (!authed) redirect('/admin/login');

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-brand-700">
            마을공동체지원센터 관리자
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin/events" className="hover:text-brand-600">
              참여신청서
            </Link>
            <Link href="/admin/surveys" className="hover:text-brand-600">
              만족도 설문조사
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
