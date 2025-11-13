# Stage 1: Builder - Instalación de dependencias y preparación
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar cache de Docker)
COPY package.json package-lock.json ./

# Instalar todas las dependencias (incluyendo devDependencies si las hay)
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production - Imagen final optimizada
FROM node:20-alpine AS production

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias instaladas desde el stage builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código de la aplicación
COPY --chown=nodejs:nodejs . .

# Cambiar al usuario no-root
USER nodejs

# Exponer el puerto de la aplicación
EXPOSE 3000

# Variables de entorno por defecto (pueden ser sobrescritas)
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]

