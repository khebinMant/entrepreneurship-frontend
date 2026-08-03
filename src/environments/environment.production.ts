export const environment = {
  production: true,
  services: {
    shared: 'https://emprendia.duckdns.org/api/shared',
    user: 'https://emprendia.duckdns.org/api/user',
    entrepreneurship: 'https://emprendia.duckdns.org/api/entrepreneurship',
    event: 'https://emprendia.duckdns.org/api/event',
  },
  keycloak: {
    url: 'https://emprendia.duckdns.org',
    realm: 'emprendia',
    clientId: 'emprendia-app',
  },
  features: {
    enableImageGallery: true,
    enableNotifications: true,
  },
};
