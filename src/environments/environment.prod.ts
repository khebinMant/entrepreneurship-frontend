export const environment = {
  production: true,
  services: {
    shared: 'https://emprendia.duckdns.org/shared',
    user: 'https://emprendia.duckdns.org/user',
    entrepreneurship: 'https://emprendia.duckdns.org/entrepreneurship',
    event: 'https://emprendia.duckdns.org/event',
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
