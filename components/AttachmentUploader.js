'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

export default function AttachmentUploader({ attachments, setAttachments }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
      });
      setAttachments((prev) => [...prev, { name: file.name, url: blob.url, contentType: file.type }]);
    } catch (err) {
      setError(err.message || '업로드에 실패했습니다.');
    }
    setUploading(false);
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
        accept=".pdf,application/pdf,.html,.htm,text/html"
        className="input-base text-sm"
        disabled={uploading}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {uploading && <p className="text-xs text-gray-400">업로드 중...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">PDF 또는 HTML 파일을 첨부할 수 있습니다. (최대 25MB)</p>
    </div>
  );
}
