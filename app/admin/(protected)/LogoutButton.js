'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="text-gray-400 hover:text-gray-700"
    >
      로그아웃
    </button>
  );
}
