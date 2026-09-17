'use client';

import { useState } from 'react';
import { copyText } from '@/lib/copyText';

// Staff share these by pasting them into 카카오톡 or a document, so the address
// is shown in full and the copy button sits right under it.
export default function ShareLink({ url, label = '주소 복사', note }) {
  const [state, setState] = useState('idle');
  if (!url) return null;

  async function copy() {
    const ok = await copyText(url);
    setState(ok ? 'copied' : 'failed');
    if (ok) setTimeout(() => setState('idle'), 1500);
  }

  return (
    <div className="space-y-2">
      <a href={url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block select-all">
        {url}
      </a>
      <button type="button" onClick={copy} className="btn-secondary text-sm w-full">
        {state === 'copied' ? '복사했습니다' : label}
      </button>
      {state === 'failed' && (
        <p className="text-xs text-red-500 leading-relaxed">
          자동 복사가 막혀 있습니다. 위 주소를 길게 눌러(또는 드래그해) 복사해 주세요.
        </p>
      )}
      {note && <p className="text-xs text-gray-400 leading-relaxed">{note}</p>}
    </div>
  );
}
