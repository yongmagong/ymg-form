'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

const EXT_KIND = { pdf: 'pdf', html: 'html', htm: 'html', md: 'md', markdown: 'md' };
const SAFETY_TIMEOUT_MS = 5 * 60 * 1000;

// Vercel Blob rejects non-ASCII (e.g. Korean) pathnames with a 400. Storage
// key is derived from the extension only; the original filename is kept
// separately as the display name.
function safeStorageName(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  return `attachment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export default function AttachmentUploader({ attachments, setAttachments }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);
  const safetyTimerRef = useRef(null);

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
    safetyTimerRef.current = setTimeout(() => controller.abort(), SAFETY_TIMEOUT_MS);
    try {
      // No onUploadProgress here on purpose: passing it switches this SDK to a
      // streamed fetch upload (duplex: 'half'), which some networks/proxies
      // hang on indefinitely right near completion. Plain buffered upload is
      // slower to show feedback but actually finishes.
      const blob = await upload(safeStorageName(file.name), file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
        multipart: file.size > 5 * 1024 * 1024,
        abortSignal: controller.signal,
      });
      setAttachments((prev) => [...prev, { name: file.name, url: blob.url, kind }]);
    } catch (err) {
      if (controller.signal.aborted) {
        setError('업로드를 중단했습니다.');
      } else {
        setError(err.message || '업로드에 실패했습니다.');
      }
    }
    clearTimeout(safetyTimerRef.current);
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
          <div className="h-1.5 w-full rounded-full bg-brand-200 animate-pulse" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">업로드 중입니다. 파일 크기에 따라 시간이 걸릴 수 있어요...</p>
            <button type="button" onClick={cancelUpload} className="text-xs text-gray-400 hover:text-red-600 whitespace-nowrap">
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
