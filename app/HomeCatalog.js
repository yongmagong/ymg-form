'use client';

import { useState } from 'react';
import { CATEGORY_OPTIONS } from '@/lib/eventOptions';
import { formatDateRange } from '@/lib/eventStatus';

const TABS = ['전체', ...CATEGORY_OPTIONS];

function EventCard({ event }) {
  const closed = event.status === '모집종료';
  const tag = event.orgLabel || event.category || '행사';
  const capacityText = event.capacity
    ? `${event.appliedCount}/${event.capacity}`
    : '모집 인원수 제한 없음';

  return (
    <a
      href={`/apply/${event.id}`}
      className="card block overflow-hidden hover:shadow-md transition-shadow p-0"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={`${event.title} 포스터`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">이미지 없음</div>
        )}
        <span
          className={`absolute top-0 left-0 text-xs font-semibold rounded-tl-lg rounded-br-lg px-3 py-1.5 ${
            closed ? 'bg-gray-600 text-white' : 'bg-brand-600 text-white'
          }`}
        >
          {event.status}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 inline-block">{tag}</span>
        <h3 className="font-bold leading-snug line-clamp-2 min-h-[2.6em]">{event.title}</h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
          <span className="w-4 h-4 rounded-full bg-brand-500 inline-block flex-shrink-0" />
          <span>
            교육/행사담당,문의:{event.ownerName || event.createdByName || '관리자'}
            {event.ownerPhone ? ` (${event.ownerPhone})` : ''}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-1 pt-1">
          <p>👥 모임인원 : {capacityText}</p>
          {event.eventStart && <p>📅 모임일시 : {formatDateRange(event.eventStart, event.eventEnd)}</p>}
          {event.locationName && <p>📍 모임장소 : {event.locationName}</p>}
        </div>
      </div>
    </a>
  );
}

export default function HomeCatalog({ events }) {
  const [tab, setTab] = useState('전체');
  const filtered = tab === '전체' ? events : events.filter((ev) => (ev.category || '행사') === tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              tab === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">현재 게시된 모임/행사가 없습니다.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
