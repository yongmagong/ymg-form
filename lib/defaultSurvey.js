// 기존에 사용하던 구글폼 만족도 조사와 동일한 기본 템플릿
const defaultSurveyTemplate = {
  title: '교육(행사) 만족도 조사',
  intro:
    '참여해 주셔서 감사합니다. 더 나은 프로그램을 만들기 위해 솔직한 의견을 들려주세요. 응답은 익명으로 처리됩니다.',
  questions: [
    { id: 'gender', text: '성별', type: 'single', options: ['남', '여'], required: true },
    {
      id: 'age',
      text: '연령대',
      type: 'single',
      options: ['20~30대', '40~50대', '60대', '70대 이상'],
      required: true,
    },
    {
      id: 'region',
      text: '거주 지역',
      type: 'single',
      options: ['수지구', '기흥구', '처인구', '기타'],
      required: true,
    },
    {
      id: 'satisfaction',
      text: '오늘의 교육/행사에 어느 정도 만족하시나요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'community_help',
      text: '오늘의 교육/행사가 마을 활동 및 공동체 활동에 도움이 되었나요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'lecture',
      text: '강의 내용에 대해서는 어떠신가요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'venue',
      text: '장소 이용에 대해서는 어떠신가요?',
      type: 'scale5',
      lowLabel: '매우 불만족',
      highLabel: '아주 만족',
      required: true,
    },
    {
      id: 'feedback',
      text: '소감, 앞으로 바라는 점 등 하고 싶은 말을 남겨주세요.',
      type: 'text',
      required: false,
    },
    {
      id: 'newsletter_email',
      text: '센터소식(뉴스레터)을 받고 싶으시다면 이메일을 적어주세요.',
      type: 'text',
      required: false,
    },
  ],
};

function cloneDefaultSurveyTemplate() {
  return JSON.parse(JSON.stringify(defaultSurveyTemplate));
}

export { defaultSurveyTemplate, cloneDefaultSurveyTemplate };
