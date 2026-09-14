import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAuthedServer, getServerAuthUser } from '@/lib/auth';
import { ADMIN_NAV } from '@/lib/adminNav';
import LogoutButton from './LogoutButton';

export default async function AdminLayout({ children }) {
  const authed = await isAuthedServer();
  if (!authed) redirect('/admin/login');
  const user = await getServerAuthUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 pt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="block">
            <p className="text-xs text-gray-400">용인시 마을공동체지원센터</p>
            <p className="text-lg font-bold text-brand-700">담당자 대시보드</p>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user?.email && <span className="text-gray-400 hidden sm:inline">{user.email}</span>}
            <Link href="/" className="text-gray-400 hover:text-brand-600">
              홈 화면 보기
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 mt-3 flex items-center gap-1 overflow-x-auto pb-3 text-sm font-medium">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-gray-600 hover:bg-gray-50 hover:text-brand-700 transition-colors"
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${item.badge}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
