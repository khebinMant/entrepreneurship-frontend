# API Map

## Shared Service (`http://localhost:8084`)

### Catalogue Types
- `GET /api/v1/catalogue-types` — List all
- `GET /api/v1/catalogue-types/:id` — Get by ID
- `POST /api/v1/catalogue-types` — Create
- `PUT /api/v1/catalogue-types/:id` — Update
- `DELETE /api/v1/catalogue-types/:id` — Delete

### Catalogue Values
- `GET /api/v1/catalogue-values` — List all (supports `catalogueTypeId` filter)
- `GET /api/v1/catalogue-values/:id` — Get by ID
- `GET /api/v1/catalogue-values/by-code/:code` — Get by catalogue type code
- `POST /api/v1/catalogue-values` — Create
- `PUT /api/v1/catalogue-values/:id` — Update
- `DELETE /api/v1/catalogue-values/:id` — Delete

### Images
- `POST /api/images/upload` — Upload image (multipart, entityType + entityId)
- `GET /api/images/list/:entityType/:entityId` — List images for entity
- `PUT /api/images/reorder` — Reorder images (body: ImageReorderRequest)
- `GET /api/images/count/:entityType/:entityId` — Count images
- `GET /api/images/can-add-more/:entityType/:entityId` — Check limit
- `DELETE /api/images/:id` — Delete image

Entity types: `USER`, `ENTREPRENEURSHIP`, `EVENT`

## User Service (`http://localhost:8081`)

### Users
- `GET /api/v1/users` — List all
- `GET /api/v1/users/:id` — Get by ID
- `GET /api/v1/users/keycloak/:keycloakId` — Get by Keycloak ID
- `POST /api/v1/users` — Create
- `PUT /api/v1/users/:id` — Update
- `PATCH /api/v1/users/:id` — Partial update
- `DELETE /api/v1/users/:id` — Delete

### User Contacts
- `GET /api/v1/user-contacts/user/:userId` — List by user
- `POST /api/v1/user-contacts` — Create
- `PUT /api/v1/user-contacts/:id` — Update
- `DELETE /api/v1/user-contacts/:id` — Delete

### User Addresses
- `GET /api/v1/user-addresses/user/:userId` — List by user
- `POST /api/v1/user-addresses` — Create
- `PUT /api/v1/user-addresses/:id` — Update
- `DELETE /api/v1/user-addresses/:id` — Delete

### User Identifications
- `GET /api/v1/user-identifications/user/:userId` — List by user
- `POST /api/v1/user-identifications` — Create
- `PUT /api/v1/user-identifications/:id` — Update
- `DELETE /api/v1/user-identifications/:id` — Delete

## Entrepreneurship Service (`http://localhost:8082`)

### Entrepreneurships
- `GET /api/v1/entrepreneurships` — List all
- `GET /api/v1/entrepreneurships/:id` — Get by ID
- `GET /api/v1/entrepreneurships/user/:userId` — Get by user
- `POST /api/v1/entrepreneurships/search` — Search with filters
- `POST /api/v1/entrepreneurships` — Create
- `PUT /api/v1/entrepreneurships/:id` — Update
- `PATCH /api/v1/entrepreneurships/:id` — Partial update
- `DELETE /api/v1/entrepreneurships/:id` — Delete

### Locations
- `GET /api/v1/entrepreneurship-locations/entrepreneurship/:id` — List by entrepreneurship
- `POST /api/v1/entrepreneurship-locations` — Create
- `PUT /api/v1/entrepreneurship-locations/:id` — Update
- `DELETE /api/v1/entrepreneurship-locations/:id` — Delete

### Social Links
- `GET /api/v1/entrepreneurship-social-links/entrepreneurship/:id` — List
- `POST /api/v1/entrepreneurship-social-links` — Create
- `PUT /api/v1/entrepreneurship-social-links/:id` — Update
- `DELETE /api/v1/entrepreneurship-social-links/:id` — Delete

### Portals
- `GET /api/v1/entrepreneurship-portals/entrepreneurship/:id` — List
- `POST /api/v1/entrepreneurship-portals` — Create
- `PUT /api/v1/entrepreneurship-portals/:id` — Update
- `DELETE /api/v1/entrepreneurship-portals/:id` — Delete

### Categories
- `GET /api/v1/categories` — List all
- `GET /api/v1/categories/:id` — Get by ID
- `POST /api/v1/categories` — Create
- `PUT /api/v1/categories/:id` — Update
- `DELETE /api/v1/categories/:id` — Delete

## Event Service (`http://localhost:8083`)

### Events
- `GET /api/v1/events` — List all
- `GET /api/v1/events/:id` — Get by ID
- `GET /api/v1/events/creator/:userId` — Get by creator
- `POST /api/v1/events/search` — Search with filters
- `POST /api/v1/events` — Create
- `PUT /api/v1/events/:id` — Update
- `PATCH /api/v1/events/:id` — Partial update
- `DELETE /api/v1/events/:id` — Delete

### Event Spaces
- `GET /api/v1/event-spaces/event/:eventId` — List by event
- `POST /api/v1/event-spaces` — Create
- `PUT /api/v1/event-spaces/:id` — Update
- `DELETE /api/v1/event-spaces/:id` — Delete

### Event Invitations
- `GET /api/v1/event-invitations/event/:eventId` — List by event
- `POST /api/v1/event-invitations` — Create
- `PATCH /api/v1/event-invitations/:id/status` — Update invitation status
- `DELETE /api/v1/event-invitations/:id` — Delete

### Event Participants
- `GET /api/v1/event-participants/event/:eventId` — List by event
- `POST /api/v1/event-participants` — Register participant
- `DELETE /api/v1/event-participants/:id` — Remove
