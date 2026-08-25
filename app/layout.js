import './globals.css';

export const metadata = {
  title: '용인시 마을공동체지원센터',
  description: '참여신청서 및 만족도 설문조사',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
