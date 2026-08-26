const defaultApplyTemplate = {
  questions: [
    { id: 'name', text: '신청인 이름', type: 'text', required: true },
    { id: 'phone', text: '연락처', type: 'text', required: true },
    { id: 'org', text: '소속공동체, 단체', type: 'text', required: false },
    {
      id: 'referral',
      text: '이 행사(교육)을 알게된 경로를 선택해 주세요',
      type: 'single',
      options: ['센터홈페이지', '블로그/인스타그램', '페이스북/당근마켓', '손바닥소식', '기타'],
      required: true,
    },
    {
      id: 'region',
      text: '거주하시는 지역이 어디신가요?',
      type: 'single',
      options: ['수지구', '기흥구', '처인구', '기타'],
      required: true,
    },
    { id: 'consentInfo', text: '개인정보 수집·이용에 동의합니다', type: 'checkbox', required: true },
    { id: 'consentPhoto', text: '사진·영상 촬영 및 제공에 동의합니다', type: 'checkbox', required: true },
  ],
};

function cloneDefaultApplyTemplate() {
  return JSON.parse(JSON.stringify(defaultApplyTemplate));
}

export { defaultApplyTemplate, cloneDefaultApplyTemplate };
