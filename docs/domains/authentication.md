# Authentication Domain

## Models

- `LoginRequest` — `{ username, password }`
- `LoginResponse` — `{ token, refreshToken, expiresIn }`
- `RegisterRequest` — `{ username, email, password, firstName, lastName }`
- `UserSession` — `{ userId, username, email, roles, token }`

## Services

- `auth.service.ts` — Login/register/logout/refresh via ApiService (legacy, being replaced by Keycloak flow)
- `keycloak.service.ts` — Wrapper around keycloak-angular's KeycloakService

## Routes

| Path | Component | Guard |
|---|---|---|
| `/login` | LoginRedirectComponent | isNotAuthenticatedGuard |
| `/register` | LoginRedirectComponent | isNotAuthenticatedGuard |

## Guards

- `isNotAuthenticatedGuard` — Redirects to `/app/dashboard` if already authenticated
