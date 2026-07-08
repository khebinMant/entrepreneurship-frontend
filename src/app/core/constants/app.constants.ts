export const APP_NAME = 'Emprendia';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'emprendia_access_token',
  REFRESH_TOKEN: 'emprendia_refresh_token',
  USER_SESSION: 'emprendia_user_session',
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
  },
  USERS: {
    BASE: `${API_PREFIX}/users`,
    BY_KEYCLOAK_ID: (keycloakId: string) => `${API_PREFIX}/users/keycloak/${keycloakId}`,
    CONTACTS: `${API_PREFIX}/user-contacts`,
    ADDRESSES: `${API_PREFIX}/user-addresses`,
    IDENTIFICATIONS: `${API_PREFIX}/user-identifications`,
  },
  ENTREPRENEURSHIPS: {
    BASE: `${API_PREFIX}/entrepreneurships`,
    BY_USER: (userId: number) => `${API_PREFIX}/entrepreneurships/user/${userId}`,
    SEARCH: `${API_PREFIX}/entrepreneurships/search`,
    LOCATIONS: `${API_PREFIX}/entrepreneurship-locations`,
    SOCIAL_LINKS: `${API_PREFIX}/entrepreneurship-social-links`,
    PORTALS: `${API_PREFIX}/entrepreneurship-portals`,
    CATEGORIES: `${API_PREFIX}/categories`,
  },
  EVENTS: {
    BASE: `${API_PREFIX}/events`,
    BY_CREATOR: (userId: number) => `${API_PREFIX}/events/creator/${userId}`,
    SEARCH: `${API_PREFIX}/events/search`,
    SPACES: `${API_PREFIX}/event-spaces`,
    INVITATIONS: `${API_PREFIX}/event-invitations`,
    PARTICIPANTS: `${API_PREFIX}/event-participants`,
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
  USER: 'USER',
} as const;
