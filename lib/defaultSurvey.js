// 기존에 사용하던 구글폼 만족도 조사와 동일한 기본 템플릿
const defaultSurveyTemplate = {
  title: '2026 주민자치 조력자양성교육 2회차 만족도 조사',
  intro:
    '자리에 참석해주신 여러분께 감사드립니다.\n앞으로 더 나은 교육 준비와 진행을 위하여 아래의 각 평가 항목에 대해 솔직하게 답변해 주시기 바랍니다.\n본 평가 설문은 무기명으로 통합하여 처리되며 조사 목적 이외 사용되지 않으며 비밀이 보장됨을 알려드립니다.',
  questions: [
    { id: 'gender', text: '성별', type: 'single', options: ['남', '여'], required: true },
    {
      id: 'age',
      text: '연령대',
      type: 'single',
      options: ['2-30대', '4-50대', '60대', '70대 이상'],
      required: true,
    },
    {
      id: 'region',
      text: '거주지',
      type: 'single',
      options: ['수지구', '기흥구', '처인구', '기타'],
      required: true,
    },
    {
      id: 'satisfaction',
      text: '1. 오늘의 교육/행사에 어느 정도 만족하시나요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'community_help',
      text: '2. 오늘의 교육/행사가 마을 활동 및 공동체 활동에 도움이 되었나요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'lecture',
      text: '3. 강의 내용에 대해서는 어떠신가요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'venue',
      text: '4. 장소의 이용에 대해서는 어떠신가요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'feedback',
      text: '5. 소감, 앞으로 바라는 점 등 하고 싶은 말을 남겨주세요. (선택)',
      type: 'text',
      required: false,
    },
    {
      id: 'newsletter_email',
      text: '6. 센터소식(뉴스레터)을 받고 싶으시다면 이메일을 적어주세요. (선택)',
      type: 'text',
      required: false,
    },
  ],
};

function cloneDefaultSurveyTemplate() {
  return JSON.parse(JSON.stringify(defaultSurveyTemplate));
}

export { defaultSurveyTemplate, cloneDefaultSurveyTemplate };
