# Emprendia

Platform for entrepreneurs to manage businesses, publish portals, organize fairs, and manage profiles.

## Tech Stack

- **Angular 21** — Standalone components, Signals, functional guards/interceptors
- **Keycloak** — OAuth2/OpenID Connect authentication (realm: `emprendia`, client: `emprendia-app`)
- **PrimeNG 21** + PrimeIcons + PrimeFlex — UI component library
- **date-fns** — Date manipulation
- **SCSS** — CSS custom properties design system

## Quick Start

```bash
npm install
npm start        # http://localhost:4200
```

## Backend Microservices

| Service | Port | Base URL |
|---|---|---|
| shared-service | 8084 | `http://localhost:8084` |
| user-service | 8081 | `http://localhost:8081` |
| entrepreneurship-service | 8082 | `http://localhost:8082` |
| event-service | 8083 | `http://localhost:8083` |

Keycloak at `http://localhost:8080`.

## Architecture

```
src/app/
  core/       — Singleton services, auth, HTTP, interceptors, guards, theme
  shared/     — Reusable UI pipes, directives, validators, utils (business-agnostic)
  layout/     — Shell (auth), PublicShell, header, sidebar, footer, pages
  authentication/ — Keycloak wrapper, login/register pages
  user/       — User profiles, contacts, addresses, identifications
  entrepreneurship/ — Entrepreneurships, locations, social links, portals, categories
  event/      — Events, spaces, invitations, participants
  shared-domain/ — Catalogues (hierarchical), image gallery (polymorphic)
```

Build: `npm run build` → output in `dist/emprendia`.
