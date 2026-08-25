import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-bold">용인시 마을공동체지원센터</h1>
        <p className="text-gray-600">참여신청서 · 만족도 설문조사 관리 시스템</p>
        <Link href="/admin" className="btn-primary inline-block">
          관리자 페이지로 이동
        </Link>
      </div>
    </main>
  );
}
