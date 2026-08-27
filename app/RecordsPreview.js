function RecordCard({ record, eventTitle }) {
  return (
    <a href={`/records/${record.id}`} className="card block overflow-hidden hover:shadow-md transition-shadow p-0">
      <div className="aspect-[4/3] bg-gray-100">
        {record.imageUrl ? (
          <img src={record.imageUrl} alt={record.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">이미지 없음</div>
        )}
      </div>
      <div className="p-4 space-y-1.5">
        {eventTitle && (
          <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 inline-block">{eventTitle}</span>
        )}
        <h3 className="font-bold leading-snug line-clamp-2">{record.title}</h3>
        <p className="text-xs text-gray-400">{new Date(record.createdAt).toLocaleDateString('ko-KR')}</p>
      </div>
    </a>
  );
}

export default function RecordsPreview({ records, eventTitleById }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">기록함</h2>
        <a href="/records" className="text-sm text-gray-400 hover:text-brand-600">
          더보기 →
        </a>
      </div>

      {records.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">아직 게시된 기록이 없습니다.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((r) => (
            <RecordCard key={r.id} record={r} eventTitle={r.linkedEventId ? eventTitleById[r.linkedEventId] : null} />
          ))}
        </div>
      )}
    </section>
  );
}
