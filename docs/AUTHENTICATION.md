# Authentication

## Flow

```
User → LoginRedirect → Keycloak login page → OAuth2 flow → Redirect to /app/dashboard
                                                              ↓
                                              keycloakEvents$ emits AuthSuccess
                                                              ↓
                                              AuthenticationService.initFromKeycloak()
                                                              ↓
                                              AuthState signal updated (keycloakId, username, roles)
```

## Keycloak Service (`authentication/services/keycloak.service.ts`)

Wraps `keycloak-angular`'s `KeycloakService`. Provides:

- `login()` / `register()` — Standard Keycloak login/register with post-login redirect to `/app/dashboard`
- `loginWithGoogle()` / `loginWithFacebook()` — Uses `idpHint` for identity provider redirect
- `logout()` — Clears Keycloak session
- `getToken()` — Returns current access token (handles refresh internally)
- `isLoggedIn()` — Sync check
- `getKeycloakInstance()` — Raw Keycloak JS adapter instance
- `keycloakEvents$` — Observable stream of auth events

## Social Login Strategy

Social login uses Keycloak's `idpHint` parameter:
- `login({ idpHint: 'google' })` → Redirects to Google identity provider
- `login({ idpHint: 'facebook' })` → Redirects to Facebook identity provider

If the identity provider is not configured in Keycloak, these fall back to the standard Keycloak login page.

## Registration

The `/register` route loads `LoginRedirectComponent` with the `isNotAuthenticatedGuard`. The "Crear Cuenta" button calls `keycloakService.register()` which initiates Keycloak registration flow. Post-registration, user-service sync is handled by the backend.

## Auth Guard

`authGuard` (core/authentication/guards/auth.guard.ts):
- Reads `AuthenticationService.authState().isAuthenticated`
- If false, redirects to `/login`
- Applied to the entire `/app/*` route tree

`isNotAuthenticatedGuard` (authentication/guards/auth.guard.ts):
- Redirects authenticated users to `/app/dashboard`
- Applied to `/login` and `/register`

## Auth Interceptor

`authInterceptor` (core/authentication/interceptors/auth.interceptor.ts):
- Injects `KeycloakService`
- Calls `getToken()` which refreshes if expired
- Attaches `Authorization: Bearer <token>` header to all HTTP requests
- Returns Observable (converts Promise via `from()` + `switchMap`)

## AuthState Signal

```typescript
AuthState {
  isAuthenticated: boolean;
  userId: string | null;      // Same as keycloakId
  keycloakId: string | null;  // Keycloak 'sub' claim
  roles: string[];            // Keycloak realm roles
  username: string | null;    // Keycloak 'preferred_username'
}
```
