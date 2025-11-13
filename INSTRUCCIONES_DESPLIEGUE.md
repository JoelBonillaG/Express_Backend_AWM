# Instrucciones de Despliegue

## Despliegue con Dockerfile

1. Construir la imagen:
```bash
docker build -t express-backend-awm .
```

2. Ejecutar el contenedor:
```bash
docker run -p 3000:3000 --env-file .env express-backend-awm
```

Para ejecutar en segundo plano:
```bash
docker run -d -p 3000:3000 --env-file .env express-backend-awm
```

## Despliegue con Docker Compose

1. Iniciar la aplicación:
```bash
docker compose up -d
```

2. Reconstruir e iniciar (si hay cambios):
```bash
docker compose up -d --build
```

3. Ver logs:
```bash
docker compose logs -f app
```

4. Detener la aplicación:
```bash
docker compose down
```

## Requisitos Previos

- Asegúrate de tener un archivo `.env` en la raíz del proyecto con las siguientes variables:
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `PORT`

