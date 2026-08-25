'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-gray-400 hover:text-gray-700">
      로그아웃
    </button>
  );
}
