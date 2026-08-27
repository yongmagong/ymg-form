'use client';

import { useState } from 'react';
import ApplyForm from './ApplyForm';

export default function ApplyGate({ eventId, questions, closed }) {
  const [open, setOpen] = useState(false);

  if (closed) {
    return (
      <div className="card text-center space-y-2">
        <p className="text-lg font-bold text-gray-600">모집이 종료되었습니다</p>
        <p className="text-gray-400 text-sm">다음 기회에 함께해 주세요.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary w-full text-lg py-4">
        신청하기
      </button>
    );
  }

  return <ApplyForm eventId={eventId} questions={questions} closed={false} />;
}
