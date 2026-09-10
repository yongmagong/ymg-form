// 'section' entries are explanation blocks inserted between real questions —
// they never collect an answer, so sheet columns / stats / validation must skip them.
function answerableQuestions(questions) {
  return (questions || []).filter((q) => q.type !== 'section');
}

export { answerableQuestions };
