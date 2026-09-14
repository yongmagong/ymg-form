export default function SiteHeader() {
  return (
    <header className="bg-white sticky top-0 z-20 border-b-2 border-brand-100">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-3 flex flex-col items-center gap-1 text-center">
        <a href="/" className="flex flex-col items-center gap-2">
          <span
            className="w-14 h-14 rounded-full shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7dd3fc 0%, #0369a1 100%)' }}
            aria-hidden="true"
          />
          <span className="text-xs text-gray-400 tracking-wide">용인시 마을공동체지원센터</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-brand-700">용마공 교육행사</span>
        </a>
        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-gray-600 mt-3">
          <a href="/" className="hover:text-brand-600">
            홈
          </a>
          <a href="/records" className="hover:text-brand-600">
            기록함
          </a>
          <a href="/surveys" className="hover:text-brand-600">
            만족도설문조사
          </a>
          <a href="/admin" className="hover:text-brand-600">
            담당자
          </a>
        </nav>
      </div>
    </header>
  );
}
