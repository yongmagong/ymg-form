const defaultApplyTemplate = {
  title: '주민자치 조력자 양성교육 신청서',
  sections: [
    {
      label: '주소',
      content: '용인시 처인구 중부대로 1161번길 69-1 용인시 마을공동체지원센터',
    },
    {
      label: '교육 안내',
      content:
        '일정 : 2026년 8월 19일(수) ~ 9월 16일(수) 오전 10시-오후1시, 매주 수요일(5주과정)\n장소 : 용인시마을공동체지원센터 2층 다목적실\n대상 : 사회적 역량 강화와 공익활동에 관심을 가진 다년차 마을활동 경험자, 단체 회의 진행이나 활동기획 경험자\n과정 : 퍼실리테이션·주민 만남을 이끄는 기술 | 주민자치의 핵심 | 지속가능한 마을의 비전 | 주민자치 자원연결, 사례\n수료증 발급(4회이상 참석), 이후 활동 연계 가능\n마감 : 2026년 8월 17일(월), 모집인원 20명\n문의 : 031)335-1070 (용인시마을공동체지원센터)',
    },
    {
      label: '교육과정',
      content:
        '8/19(수) 오전10시\n퍼실리테이션 1-주민 만남을 이끄는 기술\n\n8/26(수) 오전10시\n퍼실리테이션 2-주민 만남을 이끄는 기술',
    },
  ],
  questions: [
    { id: 'name', text: '신청인 이름', type: 'text', required: true },
    { id: 'phone', text: '연락처(000-0000-0000 형태로 입력해주세요)', type: 'text', required: true },
    { id: 'org', text: '소속공동체, 단체(없으면 "없음" 입력)', type: 'text', required: true },
    {
      id: 'referral',
      text: '이 교육과정을 알게 된 경로를 알려주세요(복수선택 가능)',
      type: 'multi',
      options: ['센터 홈페이지/블로그', '인스타그램/페이스북', '당근마켓', '용인시 손바닥소식', '기타'],
      required: true,
    },
    {
      id: 'region',
      text: '거주하시는 지역이 어디신가요?',
      type: 'single',
      options: ['수지구', '기흥구', '처인구', '기타'],
      required: true,
    },
    {
      id: 'consentInfo',
      text:
        '개인정보 수집·이용 동의(필수)\n용인시 마을공동체지원센터는 지원자의 개인정보를 중요시하며 「개인정보 보호법」을 준수하기 위해 노력합니다. 수집한 개인정보는 다음의 목적으로 보관·관리되며, 이용 기간 종료 시 지체 없이 폐기합니다. 개인정보 수집 항목은 성명, 연락처이며 신청자 본인 식별, 교육 일정 안내, 사업 관리를 위해 사용됩니다. 지원자는 동의를 거부할 권리가 있으며, 동의 거부 시 지원이 제한될 수 있습니다.',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'consentPhoto',
      text:
        '사진·영상 촬영 및 제공에 관한 동의(필수)\n초상권/저작권의 사용 대상은 본인이 촬영된 사진 또는 영상물입니다. 자료는 교육(행사)을 통해 수집되며, 수집된 사진 또는 영상물은 센터 사업 홍보와 기록 목적으로 5년까지 보유 및 이용됩니다.',
      type: 'checkbox',
      required: true,
    },
  ],
};

function cloneDefaultApplyTemplate() {
  return JSON.parse(JSON.stringify(defaultApplyTemplate));
}

export { defaultApplyTemplate, cloneDefaultApplyTemplate };
