// src/environments/environment.ts

// Función para obtener variables del entorno desde window.__env
function getEnv(key: string, defaultValue: string): string {
  // @ts-ignore
  const env = (window as any).__env;
  return env && env[key] ? env[key] : defaultValue;
}

export const environment = {
  production: false,
  services: {
    shared: getEnv('SHARED_API_URL', 'http://localhost:8084'),
    user: getEnv('USER_API_URL', 'http://localhost:8081'),
    entrepreneurship: getEnv('ENTREPRENEURSHIP_API_URL', 'http://localhost:8082'),
    event: getEnv('EVENT_API_URL', 'http://localhost:8083'),
  },
  keycloak: {
    url: getEnv('KEYCLOAK_URL', 'http://localhost:8080'),
    realm: getEnv('KEYCLOAK_REALM', 'emprendia'),
    clientId: getEnv('KEYCLOAK_CLIENT_ID', 'emprendia-app'),
  },
  features: {
    enableImageGallery: true,
    enableNotifications: true,
  },
};
