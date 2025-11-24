# Stage 1: Builder - Instalación de dependencias
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --production && npm cache clean --force

# Stage 2: Imagen optimizada en producción
FROM node:20-alpine AS production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar el resto del código
COPY . .

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "index.js"]
