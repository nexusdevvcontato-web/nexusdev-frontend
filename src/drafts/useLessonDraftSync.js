import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../api/client.js';
import { authenticatedFetch } from '../auth/session-client.js';

function isFileMap(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length > 0 &&
    Object.entries(value).every(([name, content]) =>
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(name) && !name.includes('..') &&
      typeof content === 'string'
    ));
}

function readLocalDraft(storageKey, initialFiles) {
  try {
    const raw = storageKey ? localStorage.getItem(storageKey) : null;
    if (!raw) return { files: initialFiles, exists: false };
    const parsed = JSON.parse(raw);
    return isFileMap(parsed) ? { files: { ...initialFiles, ...parsed }, exists: true } :
      { files: initialFiles, exists: false };
  } catch {
    return { files: initialFiles, exists: false };
  }
}

export function useLessonDraftSync({ challengeId, initialFiles, storagePrefix, userId }) {
  const storageKey = storagePrefix ? \`\${storagePrefix}_draft_\${challengeId}\` : null;
  const initialFilesKey = JSON.stringify(initialFiles || {});
  const [filesMap, setFilesMap] = useState(initialFiles || {});
  const filesRef = useRef(filesMap);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadedKey, setLoadedKey] = useState(null);
  const identityKey = `${userId || 'guest'}:${storagePrefix || 'none'}:${challengeId}`;
  const [status, setStatus] = useState(userId ? 'loading' : 'local');
  const [conflict, setConflict] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retrySaveCount, setRetrySaveCount] = useState(0);
  const lastCloudContentRef = useRef(null);
  const saveInFlightRef = useRef(new Set());
  const activeIdentityRef = useRef(identityKey);
  activeIdentityRef.current = identityKey;
  const editGenerationRef = useRef(0);

  const setCurrentFiles = useCallback((nextFiles) => {
    editGenerationRef.current += 1;
    filesRef.current = nextFiles;
    setFilesMap(nextFiles);
    try {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nextFiles));
    } catch {}
    setDirty(true);
    setStatus('local');
    setConflict((previous) => previous ? { ...previous, localFiles: nextFiles } : null);
  }, [storageKey]);

  useEffect(() => {
    const generationAtLoad = editGenerationRef.current;
    const local = readLocalDraft(storageKey, initialFiles || {});
    filesRef.current = local.files;
    setFilesMap(local.files);
    setRevision(0);
    setDirty(false);
    setReady(false);
    setLoadedKey(null);
    setConflict(null);
    lastCloudContentRef.current = null;

    if (!userId) {
      setReady(true);
      setLoadedKey(identityKey);
      setStatus('local');
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setStatus('loading');
    authenticatedFetch(\`\${API_BASE_URL}/api/lessons/\${encodeURIComponent(challengeId)}/draft\`, {
      method: 'GET',
      signal: controller.signal
    }).then(async (response) => {
      if (!response.ok) throw new Error('draft_load_failed');
      const payload = await response.json();
      const remote = payload?.draft;
      if (!remote || !Number.isSafeInteger(remote.revision) || remote.revision < 0) {
        throw new Error('draft_response_invalid');
      }
      if (!active) return;

      if (remote.revision > 0 && isFileMap(remote.files)) {
        const wasEditedDuringLoad = editGenerationRef.current !== generationAtLoad;
        const localFilesNow = filesRef.current;
        const localJson = JSON.stringify(local.files);
        const remoteJson = JSON.stringify(remote.files);
        const initialJson = JSON.stringify(initialFiles || {});
        if ((wasEditedDuringLoad && JSON.stringify(localFilesNow) !== remoteJson) ||
            (!wasEditedDuringLoad && local.exists && localJson !== initialJson && localJson !== remoteJson)) {
          setRevision(remote.revision);
          setConflict({ localFiles: wasEditedDuringLoad ? localFilesNow : local.files, remoteDraft: remote });
          setStatus('conflict');
        } else {
          filesRef.current = remote.files;
          setFilesMap(remote.files);
          setRevision(remote.revision);
          lastCloudContentRef.current = remoteJson;
          setDirty(false);
          setStatus('saved');
          try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify(remote.files)); } catch {}
        }
      } else if (local.exists || editGenerationRef.current !== generationAtLoad) {
        setRevision(0);
        setDirty(true);
        setStatus('local');
      } else {
        setRevision(0);
        setDirty(false);
        setStatus('local');
      }
      setReady(true);
      setLoadedKey(identityKey);
    }).catch((error) => {
      if (!active || error?.name === 'AbortError') return;
      setReady(false);
      setStatus('offline');
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [challengeId, initialFilesKey, storageKey, userId, retryCount, identityKey]);

  useEffect(() => {
    if (!userId || !ready || loadedKey !== identityKey || !dirty || conflict || saveInFlightRef.current.has(identityKey)) return undefined;
    const snapshot = filesMap;
    const snapshotJson = JSON.stringify(snapshot);
    if (snapshotJson === lastCloudContentRef.current) {
      setDirty(false);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      saveInFlightRef.current.add(identityKey);
      if (activeIdentityRef.current === identityKey) setStatus('saving');
      try {
        const response = await authenticatedFetch(\`\${API_BASE_URL}/api/lessons/\${encodeURIComponent(challengeId)}/draft\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: snapshot, expectedRevision: revision })
        });
        const payload = await response.json().catch(() => ({}));
        if (activeIdentityRef.current !== identityKey) return;
        if (response.status === 409 && payload?.conflict && payload?.draft) {
          setConflict({ localFiles: filesRef.current, remoteDraft: payload.draft });
          setStatus('conflict');
          setDirty(false);
          return;
        }
        if (!response.ok || !payload?.saved || !Number.isSafeInteger(payload?.draft?.revision)) {
          throw new Error('draft_save_failed');
        }
        lastCloudContentRef.current = snapshotJson;
        setRevision(payload.draft.revision);
        if (JSON.stringify(filesRef.current) === snapshotJson) {
          setDirty(false);
          setStatus('saved');
        } else {
          setDirty(true);
          setStatus('local');
        }
      } catch {
        if (activeIdentityRef.current === identityKey) setStatus('offline');
      } finally {
        saveInFlightRef.current.delete(identityKey);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [challengeId, filesMap, revision, dirty, ready, loadedKey, identityKey, userId, conflict, retrySaveCount]);

  const useCloudVersion = useCallback(() => {
    if (!conflict?.remoteDraft || !isFileMap(conflict.remoteDraft.files)) return;
    const remote = conflict.remoteDraft;
    filesRef.current = remote.files;
    setFilesMap(remote.files);
    setRevision(remote.revision);
    lastCloudContentRef.current = JSON.stringify(remote.files);
    setDirty(false);
    setConflict(null);
    setStatus('saved');
    try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify(remote.files)); } catch {}
  }, [conflict, storageKey]);

  const keepLocalVersion = useCallback(() => {
    if (!conflict?.remoteDraft) return;
    setRevision(conflict.remoteDraft.revision);
    setConflict(null);
    setDirty(true);
    setStatus('local');
  }, [conflict]);

  const retry = useCallback(() => {
    setRetryCount((value) => value + 1);
  }, []);

  const retrySave = useCallback(() => {
    setStatus('local');
    setDirty(true);
    setRetrySaveCount((value) => value + 1);
  }, []);

  const reset = useCallback((nextFiles) => {
    setCurrentFiles(nextFiles || {});
  }, [setCurrentFiles]);

  return {
    filesMap,
    setFilesMap: setCurrentFiles,
    reset,
    status,
    conflict,
    useCloudVersion,
    keepLocalVersion,
    retry,
    retrySave,
    isLoading: Boolean(userId && !ready)
  };
}
