export const environment = {
  production: true,
  services: {
    shared: 'https://api.emprendia.com/shared',
    user: 'https://api.emprendia.com/user',
    entrepreneurship: 'https://api.emprendia.com/entrepreneurship',
    event: 'https://api.emprendia.com/event',
  },
  keycloak: {
    url: 'https://auth.emprendia.com',
    realm: 'emprendia',
    clientId: 'emprendia-app',
  },
  features: {
    enableImageGallery: true,
    enableNotifications: true,
  },
};
