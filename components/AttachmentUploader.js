'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

const EXT_KIND = { pdf: 'pdf', html: 'html', htm: 'html', md: 'md', markdown: 'md' };
const STALL_TIMEOUT_MS = 30000;

export default function AttachmentUploader({ attachments, setAttachments }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);
  const stallTimerRef = useRef(null);

  function clearStallTimer() {
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = null;
  }

  function armStallTimer(controller) {
    clearStallTimer();
    stallTimerRef.current = setTimeout(() => {
      controller.abort();
    }, STALL_TIMEOUT_MS);
  }

  async function handleFile(file) {
    if (!file) return;
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    const kind = EXT_KIND[ext];
    if (!kind) {
      setError('PDF, HTML, MD 파일만 첨부할 수 있습니다.');
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setUploading(true);
    setProgress(0);
    armStallTimer(controller);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
        multipart: file.size > 5 * 1024 * 1024,
        abortSignal: controller.signal,
        onUploadProgress: ({ percentage }) => {
          setProgress(percentage);
          armStallTimer(controller);
        },
      });
      setAttachments((prev) => [...prev, { name: file.name, url: blob.url, kind }]);
    } catch (err) {
      if (controller.signal.aborted) {
        setError('업로드가 지연되어 중단했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.');
      } else {
        setError(err.message || '업로드에 실패했습니다.');
      }
    }
    clearStallTimer();
    abortControllerRef.current = null;
    setUploading(false);
  }

  function cancelUpload() {
    abortControllerRef.current?.abort();
  }

  function removeAttachment(i) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <a href={a.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline truncate">
                📎 {a.name}
              </a>
              <button type="button" onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-red-600 text-xs whitespace-nowrap">
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        accept=".pdf,application/pdf,.html,.htm,text/html,.md,.markdown,text/markdown"
        className="input-base text-sm"
        disabled={uploading}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">업로드 중... {progress}%</p>
            <button type="button" onClick={cancelUpload} className="text-xs text-gray-400 hover:text-red-600">
              취소
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">PDF, HTML, MD 파일을 첨부할 수 있습니다. (최대 200MB)</p>
    </div>
  );
}
