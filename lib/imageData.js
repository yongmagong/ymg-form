const MAX_INLINE_IMAGE_CHARS = 30000;

function isInlineImage(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function validateInlineImage(value) {
  if (isInlineImage(value) && value.length > MAX_INLINE_IMAGE_CHARS) {
    throw new Error('이미지 파일 용량이 큽니다. 포스터나 큰 이미지는 파일 대신 공개 이미지 링크를 넣어 주세요.');
  }
}

function validateConfigImages(item) {
  validateInlineImage(item.imageUrl);
  (item.questions || []).forEach((question) => validateInlineImage(question.imageUrl));
}

export { MAX_INLINE_IMAGE_CHARS, validateInlineImage, validateConfigImages };
