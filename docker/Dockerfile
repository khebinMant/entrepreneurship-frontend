FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG SHARED_API_URL
ARG USER_API_URL
ARG ENTREPRENEURSHIP_API_URL
ARG EVENT_API_URL
ARG KEYCLOAK_URL
ARG KEYCLOAK_REALM
ARG KEYCLOAK_CLIENT_ID

RUN echo "export const environment = {" > src/environments/environment.ts && \
    echo "  production: true," >> src/environments/environment.ts && \
    echo "  services: {" >> src/environments/environment.ts && \
    echo "    shared: '${SHARED_API_URL}'," >> src/environments/environment.ts && \
    echo "    user: '${USER_API_URL}'," >> src/environments/environment.ts && \
    echo "    entrepreneurship: '${ENTREPRENEURSHIP_API_URL}'," >> src/environments/environment.ts && \
    echo "    event: '${EVENT_API_URL}'," >> src/environments/environment.ts && \
    echo "  }," >> src/environments/environment.ts && \
    echo "  keycloak: {" >> src/environments/environment.ts && \
    echo "    url: '${KEYCLOAK_URL}'," >> src/environments/environment.ts && \
    echo "    realm: '${KEYCLOAK_REALM}'," >> src/environments/environment.ts && \
    echo "    clientId: '${KEYCLOAK_CLIENT_ID}'," >> src/environments/environment.ts && \
    echo "  }," >> src/environments/environment.ts && \
    echo "  features: {" >> src/environments/environment.ts && \
    echo "    enableImageGallery: true," >> src/environments/environment.ts && \
    echo "    enableNotifications: true," >> src/environments/environment.ts && \
    echo "  }," >> src/environments/environment.ts && \
    echo "};" >> src/environments/environment.ts

RUN npm run build

FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/emprendia/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
