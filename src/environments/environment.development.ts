export const environment = {
  production: false,
  services: {
    shared: 'http://localhost:8084',
    user: 'http://localhost:8081',
    entrepreneurship: 'http://localhost:8082',
    event: 'http://localhost:8083',
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
