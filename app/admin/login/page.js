'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-sm w-full space-y-4 text-center">
        <h1 className="text-lg font-bold">관리자 로그인</h1>
        <p className="text-sm text-gray-500">허용된 구글 계정으로만 로그인할 수 있습니다.</p>
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/admin' })}
          className="btn-primary w-full"
        >
          Google 계정으로 로그인
        </button>
      </div>
    </main>
  );
}
