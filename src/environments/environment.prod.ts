export const environment = {
  production: true,
  services: {
    shared: 'https://2.28.4.207:8443/api',
    user: 'https://2.28.4.207:8443/api',
    entrepreneurship: 'https://2.28.4.207:8443/api',
    event: 'https://2.28.4.207:8443/api',
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
