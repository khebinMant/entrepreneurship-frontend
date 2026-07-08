# User Domain

## Models

- `User` — `{ id, keycloakId, firstName, lastName, email, phone, active }`
- `UserContact` — `{ id, userId, type (catalogue), value }`
- `UserAddress` — `{ id, userId, street, city, province, country, postalCode }`
- `UserIdentification` — `{ id, userId, type (catalogue), number }`

## Service Methods

`UserService` uses `ApiService` with `environment.services.user` base URL:
- `getAll()` / `getById(id)` / `getByKeycloakId(keycloakId)`
- `create(dto)` / `update(id, dto)` / `patch(id, dto)` / `delete(id)`
- Contact CRUD: `getContacts(userId)`, `createContact(dto)`, `updateContact(id, dto)`, `deleteContact(id)`
- Address CRUD: `getAddresses(userId)`, `createAddress(dto)`, `updateAddress(id, dto)`, `deleteAddress(id)`
- Identification CRUD: `getIdentifications(userId)`, `createIdentification(dto)`, `updateIdentification(id, dto)`, `deleteIdentification(id)`

## UserStore

Signal-based store:
- `users` signal, `selectedUser` signal
- `loading` signal, `error` signal
- `loadAll()`, `loadById(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`

## Routes

| Path | Component | Guard |
|---|---|---|
| `/app/profile` | ProfileComponent | authGuard |
| `/app/settings` | SettingsComponent | authGuard |
| `/app/users` | UserListComponent | authGuard |
