import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8 sm:px-8 flex items-center">
      <section className="mx-auto w-full max-w-5xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
        <div className="rounded-2xl bg-brand-700 text-white p-8 sm:p-10 flex flex-col justify-between min-h-[420px]">
          <div>
            <p className="text-sm font-semibold text-brand-100">Yongin Community Support Center</p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight">
              용인시 마을공동체지원센터
            </h1>
            <p className="mt-5 text-lg text-brand-50 leading-relaxed">
              교육, 행사, 공동체 프로그램의 참가신청서와 만족도 설문조사를 한곳에서 만들고 관리합니다.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="font-bold">행사 생성</p>
              <p className="mt-1 text-brand-50">신청서와 설문 자동 연결</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="font-bold">QR 공유</p>
              <p className="mt-1 text-brand-50">참가자용 링크 즉시 발급</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="font-bold">시트 기록</p>
              <p className="mt-1 text-brand-50">구글시트에 응답 저장</p>
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-center text-center p-8 sm:p-10">
          <p className="text-sm font-semibold text-brand-600">관리자 전용</p>
          <h2 className="mt-3 text-2xl font-bold">신청서와 만족도 설문 관리</h2>
          <p className="mt-3 text-gray-500 leading-relaxed">
            담당자는 로그인 후 행사별 신청서, 만족도 설문, QR코드, 응답 통계를 관리할 수 있습니다.
          </p>
          <Link href="/admin" className="btn-primary mt-8 inline-flex justify-center text-lg">
            관리자 페이지로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
