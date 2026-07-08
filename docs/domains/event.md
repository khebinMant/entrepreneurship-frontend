# Event Domain

## Models

- `Event` — `{ id, title, description, startDate, endDate, location, type (catalogue), visibility, creatorId, banner, ... }`
- `EventSpace` — `{ id, eventId, name, capacity, description }`
- `EventInvitation` — `{ id, eventId, entrepreneurId, status (PENDING|ACCEPTED|REJECTED), message }`
- `EventParticipant` — `{ id, eventId, entrepreneurId, status (INVITED|ACCEPTED|REJECTED), registeredAt }`

## Service Methods

`EventService` uses `ApiService` with `environment.services.event`:
- `getAll()`, `getById(id)`, `getByCreator(userId)`
- `search(filters)` — POST with filter criteria
- `create(dto)`, `update(id, dto)`, `patch(id, dto)`, `delete(id)`
- Space CRUD
- Invitation: `getInvitations(eventId)`, `createInvitation(dto)`, `updateInvitationStatus(id, status)`, `deleteInvitation(id)`
- Participant: `getParticipants(eventId)`, `registerParticipant(dto)`, `removeParticipant(id)`

## EventStore

Signal-based state:
- `events`, `selectedEvent`, `loading`, `error`, `filters`
- `loadAll()`, `loadById(id)`, `loadByCreator(userId)`, `search(filters)`, `create(dto)`, `update(id, dto)`, `remove(id)`

## Routes

| Path | Component | Guard |
|---|---|---|
| `/app/events` | ListComponent | authGuard |
| `/app/events/create` | CreateComponent | authGuard |
| `/app/events/:id` | DetailComponent | authGuard |
| `/app/events/:id/edit` | EditComponent | authGuard |
| `/app/events/:id/invitations` | InvitationsComponent | authGuard |

Public listing at `/events` (no guard).
