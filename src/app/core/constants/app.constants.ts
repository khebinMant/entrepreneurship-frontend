export const APP_NAME = 'Emprendia';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'emprendia_access_token',
  REFRESH_TOKEN: 'emprendia_refresh_token',
  USER_SESSION: 'emprendia_user_session',
  USER_ROLES: 'emprendia_user_roles',
  THEME: 'emprendia_theme',
} as const;

export const API_PREFIX = '/api/v1';
export const IMAGE_API_PREFIX = '/api/images';
export const FILE_API_PREFIX = '/api/files';

export const API_ENDPOINTS = {
  SHARED: {
    CATALOGUE_TYPES: `${API_PREFIX}/catalogue-types`,
    CATALOGUE_VALUES: `${API_PREFIX}/catalogue-values`,
    IMAGES: `${IMAGE_API_PREFIX}`,
    FILES: `${FILE_API_PREFIX}`,
    ENTITY_SOCIAL_LINKS: `${API_PREFIX}/entity-social-links`,
    ENTITY_PORTALS: `${API_PREFIX}/entity-portals`,
  },
  USERS: {
    BASE: `${API_PREFIX}/users`,
    BY_KEYCLOAK_ID: (keycloakId: string) => `${API_PREFIX}/users/keycloak/${keycloakId}`,
    CHANGE_PASSWORD: (userId: number) => `${API_PREFIX}/users/${userId}/change-password`,
    UPDATE_EMAIL: (userId: number) => `${API_PREFIX}/users/${userId}/email`,
    CONTACTS: `${API_PREFIX}/user-contacts`,
    CONTACTS_BY_USER: (userId: number) => `${API_PREFIX}/user-contacts/user/${userId}`,
    ADDRESSES: `${API_PREFIX}/user-addresses`,
    ADDRESSES_BY_USER: (userId: number) => `${API_PREFIX}/user-addresses/user/${userId}`,
    IDENTIFICATIONS: `${API_PREFIX}/user-identifications`,
    IDENTIFICATIONS_BY_USER: (userId: number) => `${API_PREFIX}/user-identifications/user/${userId}`,
  },
  ENTREPRENEURSHIPS: {
    BASE: `${API_PREFIX}/entrepreneurships`,
    BY_USER: (userId: number) => `${API_PREFIX}/entrepreneurships/user/${userId}`,
    SEARCH: `${API_PREFIX}/entrepreneurships/search`,
    LOCATIONS: `${API_PREFIX}/entrepreneurship-locations`,
    ENTITY_SOCIAL_LINKS: `${API_PREFIX}/entity-social-links`,
    ENTITY_PORTALS: `${API_PREFIX}/entity-portals`,
    CATEGORIES: `${API_PREFIX}/categories`,
    ANALYTICS_GLOBAL: `${API_PREFIX}/entrepreneurships/analytics/global`,
    STATS_USER: (userId: number) => `${API_PREFIX}/entrepreneurships/stats/user/${userId}`,
  },
  EVENTS: {
    BASE: `${API_PREFIX}/events`,
    BY_CREATOR: (userId: number) => `${API_PREFIX}/events/creator/${userId}`,
    SEARCH: `${API_PREFIX}/events/search`,
    SPACES: `${API_PREFIX}/event-spaces`,
    INVITATIONS: `${API_PREFIX}/event-invitations`,
    PARTICIPANTS: `${API_PREFIX}/event-participants`,
    ANALYTICS_GLOBAL: `${API_PREFIX}/events/analytics/global`,
    STATS_CREATOR: (userId: number) => `${API_PREFIX}/events/stats/creator/${userId}`,
  },
} as const;

export const ROUTE_PATHS = {
  ROOT: '',
  AUTH: {
    LOGIN: 'login',
    LOGOUT: 'logout',
  },
  USER: {
    PROFILE: 'profile',
    SETTINGS: 'settings',
    LIST: 'users',
  },
  DASHBOARD: 'dashboard',
  ENTREPRENEURSHIP: {
    DASHBOARD: 'dashboard',
    LIST: 'entrepreneurships',
    CREATE: 'entrepreneurships/create',
    DETAIL: 'entrepreneurships/:id',
    EDIT: 'entrepreneurships/:id/edit',
  },
  EVENT: {
    LIST: 'events',
    CREATE: 'events/create',
    DETAIL: 'events/:id',
    EDIT: 'events/:id/edit',
    INVITATIONS: 'events/:id/invitations',
  },
  SHARED: {
    CATEGORIES: 'categories',
    CATALOGUES: 'catalogues',
    IMAGES: 'images',
  },
  NOT_FOUND: 'not-found',
  UNAUTHORIZED: 'unauthorized',
} as const;

export const ENTITY_TYPE = {
  USER: 'USER',
  ENTREPRENEURSHIP: 'ENTREPRENEURSHIP',
  EVENT: 'EVENT',
} as const;

export const CATALOGUE_CODES = {
  COUNTRY: 'COUNTRY',
  PROVINCE: 'PROVINCE',
  CITY: 'CITY',
  PARISH: 'PARISH',
  CONTACT_TYPE: 'CONTACT_TYPE',
  IDENTIFICATION_TYPE: 'IDENTIFICATION_TYPE',
  EVENT_TYPE: 'EVENT_TYPE',
  EVENT_VISIBILITY: 'EVENT_VISIBILITY',
  INVITATION_STATUS: 'INVITATION_STATUS',
  EVENT_PARTICIPATION_STATUS: 'EVENT_PARTICIPATION_STATUS',
  SOCIAL_PLATFORM: 'SOCIAL_PLATFORM',
  THEME_TYPE: 'THEME_TYPE',
} as const;

export const INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export const PARTICIPATION_STATUS = {
  INVITED: 'INVITED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export const APP_ROLE = {
  ADMIN: 'ADMIN',
  ADMIN_KEYCLOAK: 'default-roles-emprendia',
  USER: 'USER',
} as const;

export const ADMIN_ROLES = [APP_ROLE.ADMIN_KEYCLOAK, APP_ROLE.ADMIN] as const;
