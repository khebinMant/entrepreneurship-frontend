export const environment = {
  production: true,
  services: {
    shared: 'https://2.28.4.207:8443',
    user: 'https://2.28.4.207:8443',
    entrepreneurship: 'https://2.28.4.207:8443',
    event: 'https://2.28.4.207:8443',
  },
  keycloak: {
    url: 'https://2.28.4.207:8443/auth',
    realm: 'emprendia',
    clientId: 'emprendia-app',
  },
  features: {
    enableImageGallery: true,
    enableNotifications: true,
  },
};
