'use client';

import { useEffect, useState } from 'react';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR');
}

export default function StaffPage() {
  const [staff, setStaff] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '직원 목록을 불러오지 못했습니다.');
      setStaff(data.staff || []);
      setCurrentUser(data.currentUser || null);
    } catch (err) {
      setStaff([]);
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addStaff(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || '추가하지 못했습니다.');
      return;
    }
    setEmail('');
    setName('');
    load();
  }

  async function setStatus(member, status) {
    setStaff((prev) => prev.map((s) => (s.id === member.id ? { ...s, status } : s)));
    const res = await fetch(`/api/admin/staff/${encodeURIComponent(member.email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError('상태를 변경하지 못했습니다.');
      load();
    }
  }

  async function removeStaff(member) {
    if (!confirm(`${member.email} 계정을 목록에서 제거하시겠습니까?`)) return;
    await fetch(`/api/admin/staff/${encodeURIComponent(member.email)}`, { method: 'DELETE' });
    load();
  }

  if (!staff) return <p className="text-gray-400">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">직원 관리</h1>
        <p className="text-gray-500 text-sm mt-1">
          구글 계정으로 로그인한 직원 목록입니다. 조직 계정(도메인)은 처음 로그인할 때 자동으로 등록됩니다.
        </p>
      </div>

      {error && (
        <div className="card border-red-100 bg-red-50 text-red-700 text-sm leading-relaxed">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={addStaff} className="card space-y-3">
        <h2 className="font-semibold text-sm">외부 계정 미리 허용하기</h2>
        <p className="text-xs text-gray-500">
          조직 도메인 계정이 아닌 개인 구글 계정(Gmail 등)을 로그인 전에 미리 허용하려면 여기에 등록하세요.
        </p>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_8rem]">
          <input
            className="input-base text-sm"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-base text-sm"
            placeholder="이름 (선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn-primary text-sm" disabled={saving}>
            {saving ? '추가 중...' : '허용 추가'}
          </button>
        </div>
      </form>

      {staff.length === 0 ? (
        <p className="text-gray-400 text-sm">아직 로그인한 직원이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {staff.map((s) => (
            <div key={s.id} className="card flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{s.email}</p>
                  {s.name && <span className="text-sm text-gray-500">{s.name}</span>}
                  {s.email === currentUser?.email && (
                    <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-0.5">나</span>
                  )}
                  <span className={`text-xs rounded-full px-2 py-1 ${s.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {s.status === 'blocked' ? '차단됨' : '허용됨'}
                  </span>
                  <span className="text-xs rounded-full bg-gray-100 text-gray-500 px-2 py-1">
                    {s.source === 'domain' ? '조직 계정' : '개별 등록'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  최초 로그인 {formatDate(s.firstLoginAt)} · 마지막 로그인 {formatDate(s.lastLoginAt)}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {s.status === 'blocked' ? (
                  <button type="button" onClick={() => setStatus(s, 'allowed')} className="btn-secondary text-xs">
                    차단 해제
                  </button>
                ) : (
                  <button type="button" onClick={() => setStatus(s, 'blocked')} className="btn-secondary text-xs">
                    차단
                  </button>
                )}
                <button type="button" onClick={() => removeStaff(s)} className="px-3 py-1.5 text-xs text-red-500 hover:underline">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
