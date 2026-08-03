export const environment = {
  production: false,
  services: {
    shared: 'http://localhost:8090/api/shared',
    user: 'http://localhost:8090/api/user',
    entrepreneurship: 'http://localhost:8090/api/entrepreneurship',
    event: 'http://localhost:8090/api/event',
  },
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'emprendia',
    clientId: 'emprendia-app',
  },
  features: {
    enableImageGallery: true,
    enableNotifications: true,
  },
};
