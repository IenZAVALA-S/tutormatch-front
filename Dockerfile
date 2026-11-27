# Front de TutorMatch: se compila con Node y se sirve con nginx.
# Los tipos de GraphQL (src/gql) están en el repo, así que el build no
# necesita el BFF.

# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Servir ----
# nginx sin root (escucha en 8080), como se espera en Kubernetes.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/salud || exit 1
