import crypto from 'crypto';

// Short, URL-friendly unique id (base64url) instead of a full 36-char UUID,
// so distributed links like /apply/{id} and /survey/{id} stay as short as
// possible. length=8 gives 64^8 (~2.8e14) combinations, plenty for this
// scale of usage.
function shortId(length = 8) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

export { shortId };
