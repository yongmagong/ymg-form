'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || '로그인에 실패했습니다.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="card max-w-sm w-full space-y-4">
        <h1 className="text-lg font-bold text-center">관리자 로그인</h1>
        <input
          type="password"
          className="input-base"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '확인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}
