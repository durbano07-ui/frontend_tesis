# Etapa 1: build de la app con Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# URL del backend, se inyecta en tiempo de build (Dokploy > Environment > Build-time Arguments)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Huellas de los scripts en línea permitidos por la CSP (OWASP ASVS V14.4.3)
RUN node scripts/generate-csp-hashes.mjs dist csp-hashes.conf

# Origen de la API (https://host) para la CSP, a partir de VITE_API_URL
RUN API_ORIGIN=$(echo "$VITE_API_URL" | sed -E 's#^(https?://[^/]+).*#\1#') \
    && sed "s#__API_ORIGIN__#${API_ORIGIN}#g" security-headers.conf > security-headers.final.conf

# Etapa 2: servir los archivos estáticos con nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/security-headers.final.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/csp-hashes.conf /etc/nginx/snippets/csp-hashes.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
