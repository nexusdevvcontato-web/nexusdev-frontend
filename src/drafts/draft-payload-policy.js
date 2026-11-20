const MAX_FILE_BYTES = 50 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024;
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const FORBIDDEN_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

export function isValidDraftFiles(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  let totalBytes = 0;
  for (const [name, content] of entries) {
    if (!FILE_NAME.test(name) || name.includes('..') || typeof content !== 'string' ||
        FORBIDDEN_CONTROLS.test(content)) return false;
    const bytes = new TextEncoder().encode(content).byteLength;
    if (bytes > MAX_FILE_BYTES) return false;
    totalBytes += bytes;
    if (totalBytes > MAX_TOTAL_BYTES) return false;
  }
  return true;
}

export function validateRemoteDraft(payload) {
  const draft = payload?.draft;
  if (!draft || !Number.isSafeInteger(draft.revision) || draft.revision < 0 ||
      !draft.files || typeof draft.files !== 'object' || Array.isArray(draft.files)) {
    throw new Error('draft_response_invalid');
  }
  if (draft.revision > 0 && !isValidDraftFiles(draft.files)) {
    throw new Error('draft_response_invalid');
  }
  if (draft.revision === 0 && Object.keys(draft.files).length !== 0) {
    throw new Error('draft_response_invalid');
  }
  return draft;
}
