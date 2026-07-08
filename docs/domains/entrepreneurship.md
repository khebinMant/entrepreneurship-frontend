# Entrepreneurship Domain

## Models

- `Entrepreneurship` — `{ id, name, description, logo, slogan, mission, vision, userId, categoryId, active, ... }`
- `EntrepreneurshipLocation` — `{ id, entrepreneurshipId, address, latitude, longitude, cityId, provinceId, countryId }`
- `EntrepreneurshipSocialLink` — `{ id, entrepreneurshipId, platform (catalogue), url }`
- `EntrepreneurshipPortal` — `{ id, entrepreneurshipId, theme, published, customDomain }`
- `Category` — `{ id, name, description, parentId }`

## Service Methods

`EntrepreneurshipService` uses `ApiService` with `environment.services.entrepreneurship`:
- `getAll()`, `getById(id)`, `getByUser(userId)`
- `search(filters)` — POST with filter criteria
- `create(dto)`, `update(id, dto)`, `patch(id, dto)`, `delete(id)`
- Location CRUD, SocialLink CRUD, Portal CRUD
- Category CRUD

## EntrepreneurshipStore

Signal-based state:
- `entrepreneurships`, `selectedEntrepreneurship`, `loading`, `error`, `filters`
- `loadAll()`, `loadById(id)`, `loadByUser(userId)`, `search(filters)`, `create(dto)`, `update(id, dto)`, `remove(id)`
- Image enrichment via ImageService

## Routes

| Path | Component | Guard |
|---|---|---|
| `/app/dashboard` | DashboardComponent | authGuard |
| `/app/entrepreneurships` | ListComponent | authGuard |
| `/app/entrepreneurships/create` | CreateComponent | authGuard |
| `/app/entrepreneurships/:id` | DetailComponent | authGuard |
| `/app/entrepreneurships/:id/edit` | EditComponent | authGuard |

Public listing at `/entrepreneurships` (no guard).
