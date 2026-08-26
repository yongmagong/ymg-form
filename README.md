# 용인시 마을공동체지원센터 — 참여신청서 & 만족도 설문조사

Next.js로 만든 신청서/설문조사 웹앱입니다. 응답은 지정한 구글시트에 자동으로 기록됩니다.

## 1. 처음 한 번만: 구글 서비스 계정 만들기 (구글시트 연동용)

1. https://console.cloud.google.com 접속 → 프로젝트 생성 (아무 이름)
2. 좌측 메뉴 "API 및 서비스" → "라이브러리" → "Google Sheets API" 검색 후 **사용 설정**
3. "API 및 서비스" → "사용자 인증 정보" → "사용자 인증 정보 만들기" → **서비스 계정** 생성
4. 생성된 서비스 계정 클릭 → "키" 탭 → "키 추가" → JSON 다운로드
5. JSON 파일 안에 있는 `client_email` 값과 `private_key` 값을 아래 환경변수에 사용
6. 기록될 구글시트(예: 기존 신청서 시트)를 열어 "공유" → 위 `client_email` 주소를 **편집자**로 추가

## 2. 처음 한 번만: 관리자 로그인용 구글 OAuth 클라이언트 만들기

관리자 로그인은 비밀번호 대신 **허용된 구글 계정으로만** 가능합니다 (직원들이 이미 쓰는 구글 아이디).

1. 같은 Google Cloud 프로젝트에서 "API 및 서비스" → "사용자 인증 정보" → "사용자 인증 정보 만들기" → **OAuth 클라이언트 ID**
2. 애플리케이션 유형: **웹 애플리케이션**
3. "승인된 리디렉션 URI"에 추가: `https://ymg-form.vercel.app/api/auth/callback/google` (실제 배포 주소가 다르면 그 주소로)
4. 생성 후 나오는 **클라이언트 ID**와 **클라이언트 보안 비밀번호**를 아래 환경변수에 사용
5. 로그인을 허용할 직원들의 구글 이메일 주소를 `ADMIN_ALLOWED_EMAILS`에 쉼표로 나열 (여기 없는 계정은 로그인해도 접근 거부됩니다)

## 3. 배포 환경변수 (Vercel)

| 변수명 | 설명 |
|---|---|
| `ADMIN_ALLOWED_EMAILS` | 관리자 로그인을 허용할 구글 이메일 목록 (쉼표로 구분) |
| `GOOGLE_OAUTH_CLIENT_ID` | 관리자 로그인용 OAuth 클라이언트 ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | 관리자 로그인용 OAuth 클라이언트 보안 비밀번호 |
| `NEXTAUTH_SECRET` | 로그인 세션 서명용 임의의 긴 문자열 |
| `NEXTAUTH_URL` | 배포된 실제 주소 (예: `https://ymg-form.vercel.app`) |
| `GOOGLE_CLIENT_EMAIL` | 구글시트 연동용 서비스 계정 JSON의 `client_email` |
| `GOOGLE_PRIVATE_KEY` | 서비스 계정 JSON의 `private_key` (줄바꿈 `\n` 포함 그대로) |
| `GOOGLE_SHEET_ID` | 기록 대상 구글시트 ID |

## 4. 사용 방법

- `/admin` 에서 로그인 후 참여신청서/설문조사 생성
- 참여신청서: 제목·안내 내용 입력 → 만족도 설문과 연결(선택) → QR 다운로드 → 홍보물에 삽입
- 만족도 설문조사: "기본 템플릿 불러오기"로 기존 설문 구조를 그대로 시작하거나 처음부터 항목 구성 → QR 다운로드 → 통계 페이지에서 그래프 확인
- 참여신청서 응답은 `신청자_명단` 탭에, 설문 응답은 설문마다 자동 생성되는 탭에 기록됩니다. 기존 `Sheet1` 탭이 있으면 자동으로 `신청자_명단`으로 이름을 바꿉니다.

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```
