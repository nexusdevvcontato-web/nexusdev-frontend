const MAX_FILES = 10;
const MAX_FILE_BYTES = 50 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024;
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const FORBIDDEN_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

export function isValidDraftFiles(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0 || entries.length > MAX_FILES) return false;
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
      (draft.files !== null && (typeof draft.files !== 'object' || Array.isArray(draft.files)))) {
    throw new Error('draft_response_invalid');
  }
  // The API represents a never-saved draft as { revision: 0, files: null }.
  // Normalize that one documented empty state for the editor; reject null for persisted revisions.
  if (draft.revision > 0 && !isValidDraftFiles(draft.files)) {
    throw new Error('draft_response_invalid');
  }
  if (draft.revision === 0 && draft.files !== null && Object.keys(draft.files).length !== 0) {
    throw new Error('draft_response_invalid');
  }
  return { ...draft, files: draft.files || {} };
}

export function validateSavedDraftResponse(payload, expectedRevision) {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
      expectedRevision >= Number.MAX_SAFE_INTEGER ||
      payload?.saved !== true ||
      !Number.isSafeInteger(payload?.draft?.revision) ||
      payload.draft.revision !== expectedRevision + 1) {
    throw new Error('draft_save_response_invalid');
  }
  return payload.draft.revision;
}
