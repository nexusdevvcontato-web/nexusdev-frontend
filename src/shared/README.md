# Shared frontend platform

Target location for code intentionally shared across features.

Planned areas:

- `api/` — typed-by-contract HTTP client, response handling and error normalization.
- `auth/` — session state integration; no credential persistence.
- `config/` — validated public runtime configuration.
- `components/` — accessible, feature-neutral UI primitives.
- `hooks/` — reusable React hooks with no hidden network side effects.
- `utils/` — small pure utilities.

Do not move legacy code here without reviewing its dependencies and security behavior.
Feature-specific business rules stay inside their owning feature.
