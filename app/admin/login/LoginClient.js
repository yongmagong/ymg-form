'use client';

import { signIn } from 'next-auth/react';

export default function LoginClient({ configured, missing }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-sm w-full space-y-4 text-center">
        <h1 className="text-lg font-bold">담당자 로그인</h1>
        {configured ? (
          <>
            <p className="text-sm text-gray-500">허용된 구글 계정으로만 로그인할 수 있습니다.</p>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              className="btn-primary w-full"
            >
              Google 계정으로 로그인
            </button>
          </>
        ) : (
          <div className="space-y-3 text-left">
            <p className="text-sm text-gray-600">
              Google 로그인 설정이 아직 완료되지 않았습니다. Vercel 환경변수에 아래 항목을 추가한 뒤 다시 배포해 주세요.
            </p>
            <ul className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
              {missing.map((name) => (
                <li key={name} className="font-mono">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
