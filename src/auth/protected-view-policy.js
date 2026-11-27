const AUTHENTICATED_VIEWS = new Set(['profile', 'sessions', 'privacy']);

export function isAuthenticatedView(view) {
  return AUTHENTICATED_VIEWS.has(view);
}

// Persisted navigation is restored before the server session is resolved.
// Fail closed: private views are opened only after the API confirms identity.
export function resolveViewForSession(view, authenticated = false, fallback = 'home') {
  return isAuthenticatedView(view) && !authenticated ? fallback : view;
}
