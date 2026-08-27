import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link href="/admin/events" className="card hover:shadow-md transition-shadow block">
        <h2 className="text-lg font-bold mb-2">📋 참여신청서</h2>
        <p className="text-gray-600 text-sm">
          교육/행사 참여신청서를 만들고, QR코드를 다운로드하고, 신청 현황을 확인합니다.
        </p>
      </Link>
      <Link href="/admin/surveys" className="card hover:shadow-md transition-shadow block">
        <h2 className="text-lg font-bold mb-2">📊 만족도 설문조사</h2>
        <p className="text-gray-600 text-sm">
          설문 항목을 자유롭게 구성하고, QR코드를 배포하고, 통계 그래프로 결과를 확인합니다.
        </p>
      </Link>
      <Link href="/admin/records" className="card hover:shadow-md transition-shadow block">
        <h2 className="text-lg font-bold mb-2">🗂 기록함</h2>
        <p className="text-gray-600 text-sm">
          교육/행사 후 자료와 후기를 웹페이지로 올리고, 홈페이지에 공개합니다.
        </p>
      </Link>
    </div>
  );
}
