// Single source of truth for the admin top nav + dashboard home cards, so
// both stay in sync. `badge` must be a complete Tailwind class string (not
// built with string interpolation) so the JIT compiler can see it statically.
const ADMIN_NAV = [
  {
    href: '/admin/events',
    label: '참여신청서 관리',
    icon: '📋',
    badge: 'bg-brand-100 text-brand-700',
    desc: '교육/행사 참여신청서를 만들고 수정·복사·배포 상태를 관리합니다.',
  },
  {
    href: '/admin/applicants',
    label: '참여신청자 보기',
    icon: '👥',
    badge: 'bg-blue-100 text-blue-700',
    desc: '신청서별 신청자 현황을 확인하고 CSV로 내려받거나 구글시트를 엽니다.',
  },
  {
    href: '/admin/surveys',
    label: '만족도설문조사 관리',
    icon: '📝',
    badge: 'bg-purple-100 text-purple-700',
    desc: '만족도 설문 항목을 구성하고 수정·복사·배포 상태를 관리합니다.',
  },
  {
    href: '/admin/responses',
    label: '만족도설문조사 보기',
    icon: '📊',
    badge: 'bg-green-100 text-green-700',
    desc: '설문별 통계 그래프를 보고 CSV로 내려받거나 구글시트를 엽니다.',
  },
  {
    href: '/admin/records',
    label: '기록함 관리',
    icon: '🗂',
    badge: 'bg-amber-100 text-amber-700',
    desc: '교육/행사 후기·자료를 만들고 수정·복사·배포 상태를 관리합니다.',
  },
  {
    href: '/admin/staff',
    label: '직원 관리',
    icon: '🔑',
    badge: 'bg-slate-200 text-slate-700',
    desc: '구글 계정으로 로그인한 직원 목록과 관리자 권한을 관리합니다.',
  },
];

export { ADMIN_NAV };
