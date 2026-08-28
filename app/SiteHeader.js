export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <a href="/" className="block">
          <p className="text-xs text-gray-400">용인시 마을공동체지원센터</p>
          <p className="text-lg font-bold text-brand-700">용마공 교육행사</p>
        </a>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600">
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
