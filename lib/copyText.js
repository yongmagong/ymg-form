// Copying a link has to work in KakaoTalk's in-app browser, which refuses the
// async clipboard API and does not implement prompt() at all — a prompt-based
// fallback throws there instead of degrading. So: try the modern API, fall back
// to a hidden textarea + execCommand, and let the caller show a manual-copy hint
// if both fail.
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Permission denied or insecure context — fall through to execCommand.
  }

  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(field);
    return ok;
  } catch (err) {
    return false;
  }
}

export { copyText };
