# Architecture

## Folder Structure

```
src/app/
  core/                  — Singleton services (providedIn: 'root')
    authentication/      — AuthService, authGuard, authInterceptor
    http/                — ApiService (multi-backend), interceptors
    guards/              — permissionGuard
    error-handler/       — GlobalErrorHandler
    storage/             — localStorage/sessionStorage wrappers
    permission/          — PermissionService, HasRoleDirective
    config/              — AppConfigService (reads environment)
    theme/               — ThemeService, ThemeToggleComponent
    constants/           — STORAGE_KEYS, API_ENDPOINTS, ROUTE_PATHS, etc.
  shared/                — Business-agnostic reusable code
    pipes/               — truncate, dateFormat, capitalize
    directives/          — clickOutside, tooltip, debounce
    validators/          — passwordStrength, dniValidator, phoneValidator
    models/              — Pagination, Sort, Filter
    utils/               — string, date, form utilities
    ui/                  — Reusable UI components (stubs)
    dialogs/             — Confirm/Alert dialogs (stubs)
  layout/                — Application shell
    components/          — Shell, PublicShell, Header, Sidebar, Footer, PublicNav
    pages/               — Home, LoginRedirect, NotFound, Unauthorized
  authentication/        — Domain: Keycloak wrapper, login/register routes
  user/                  — Domain: users, contacts, addresses, identifications
  entrepreneurship/      — Domain: entrepreneurships, locations, social links, portals, categories
  event/                 — Domain: events, spaces, invitations, participants
  shared-domain/         — Domain: catalogues (hierarchical), image gallery (polymorphic)
```

## Layering (DDD)

- **Core** → Infrastructure + cross-cutting concerns. No business logic.
- **Shared** → Pure, business-agnostic utilities/UI. No imports from domains.
- **Domains** → Self-contained bounded contexts. Each has models, services, state, pages, routes.

## Routing

- **Public** (PublicShell) → `/`, `/login`, `/register`, `/events`, `/entrepreneurships`
- **Authenticated** (Shell + sidebar) → `/app/dashboard`, `/app/profile`, `/app/entrepreneurships`, etc.
- Guards: `authGuard` (redirects to `/login`), `isNotAuthenticatedGuard` (redirects to `/app/dashboard`)

## Decision Log

| Decision | Rationale |
|---|---|
| **Signals over RxJS for state** | Simpler, synchronous, native to Angular. RxJS only for HTTP/events. |
| **Standalone components** | Angular default. No NgModules. Better tree-shaking. |
| **Multi-backend ApiService** | 4 microservices with different base URLs. ApiService takes baseUrl param. |
| **Functional interceptors/guards** | Angular best practice. Simpler, tree-shakeable. |
| **CSS custom properties** | Runtime theme switching without rebuilding. Dark mode via `data-theme`. |
