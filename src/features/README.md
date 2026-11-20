# NexusDev 2.0 — Frontend feature boundaries

This directory is the target home for independently maintained product features.
The current application entry points remain untouched during the parallel rebuild.

## Planned feature areas

- `authentication/` — sign-in, sign-up, session lifecycle and account linking.
- `dashboard/` — learner overview and activity.
- `curriculum/` — tracks, modules, lessons and prerequisites.
- `code-editor/` — editor UI and isolated execution client.
- `exercises/` — exercise presentation, validation and feedback.
- `tutor/` — tutoring interface and API client.
- `gamification/` — XP, achievements and streak presentation.
- `certificates/` — certificate viewing and verification UI.
- `community/` — comments and community interactions.
- `profile/` — learner profile and preferences.

## Boundary rules

1. Features must not import another feature's private implementation.
2. Cross-feature contracts belong in an explicitly shared interface.
3. API access, session handling and environment configuration must not be duplicated.
4. Never store plaintext passwords or treat client-side state as authorization.
5. Code execution must happen outside the application origin in a separately isolated runtime.
6. Migrate one feature at a time and keep the legacy application operational until parity is verified.
