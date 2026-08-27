'use client';

import { useState } from 'react';
import { CATEGORY_OPTIONS } from '@/lib/eventOptions';
import { formatDateRange, formatRecruitPeriod } from '@/lib/eventStatus';

const TABS = ['전체', ...CATEGORY_OPTIONS];

function EventCard({ event }) {
  const closed = event.status === '모집종료';
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
          className={`absolute top-2 left-2 text-xs font-semibold rounded-full px-2 py-1 ${
            closed ? 'bg-gray-700/80 text-white' : 'bg-brand-600 text-white'
          }`}
        >
          {event.status}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-0.5">{event.category || '행사'}</span>
          {event.orgLabel && (
            <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">{event.orgLabel}</span>
          )}
        </div>
        <h3 className="font-bold leading-snug line-clamp-2">{event.title}</h3>
        <div className="text-xs text-gray-500 space-y-0.5">
          {event.eventStart && <p>📅 {formatDateRange(event.eventStart, event.eventEnd)}</p>}
          {event.locationName && <p>📍 {event.locationName}</p>}
          <p>
            👥 신청 {event.appliedCount}명{event.capacity ? ` / 정원 ${event.capacity}명` : ''}
          </p>
          {(event.recruitStart || event.recruitEnd) && (
            <p>🗓 모집 {formatRecruitPeriod(event.recruitStart, event.recruitEnd)}</p>
          )}
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
