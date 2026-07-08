# Shared Domain

## Catalogue

Hierarchical catalogue system for lookup values.

### Models

- `CatalogueType` — `{ id, code, name, description, active }`
- `CatalogueValue` — `{ id, catalogueTypeId, code, name, description, parentId (optional), active }`

### Service Methods

`CatalogueService`:
- `getTypes()` — List all catalogue types
- `getTypeById(id)` — Get type by ID
- `createType(dto)`, `updateType(id, dto)`, `deleteType(id)`
- `getValues(catalogueTypeId?)` — List values (optional type filter)
- `getValueById(id)` — Get value by ID
- `getValuesByCode(code)` — Get values by catalogue type code
- `createValue(dto)`, `updateValue(id, dto)`, `deleteValue(id)`

Catalogue codes: `COUNTRY`, `PROVINCE`, `CITY`, `PARISH`, `CONTACT_TYPE`, `IDENTIFICATION_TYPE`, `EVENT_TYPE`, `EVENT_VISIBILITY`, `INVITATION_STATUS`, `SOCIAL_PLATFORM`, `THEME_TYPE`

## Image Gallery

Polymorphic image gallery supporting any entity type (`USER`, `ENTREPRENEURSHIP`, `EVENT`).

### Models

- `ImageGallery` — `{ id, entityType, entityId, url, thumbnailUrl, fileName, mimeType, size, orderIndex, createdAt }`
- `ImageUploadResponse` — `{ id, url, thumbnailUrl }`
- `ImageReorderRequest` — `{ imageIds: number[] }`

### Service Methods

`ImageService`:
- `upload(entityType, entityId, file)` — Upload image (FormData)
- `list(entityType, entityId)` — List images for entity
- `reorder(requests)` — Reorder images
- `count(entityType, entityId)` — Count images
- `canAddMore(entityType, entityId)` — Check if limit reached
- `delete(id)` — Delete image
