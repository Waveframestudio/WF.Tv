# FoodScreen Manager

Plataforma SaaS para gestión y reproducción de contenido digital en pantallas de locales de comida.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend Admin | React + Vite + TypeScript + Tailwind CSS |
| Backend | NestJS + Prisma |
| Base de datos | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| TV App | Android Kotlin + Jetpack Compose for TV + ExoPlayer |
| Monorepo | Turborepo |

## Estructura

```
foodscreen-manager/
├── apps/
│   ├── admin/        # React + Vite admin panel
│   ├── api/          # NestJS backend
│   └── tv-app/       # Android TV app
├── packages/
│   └── shared-types/ # TypeScript types compartidos
├── docker-compose.dev.yml
└── turbo.json
```

## Setup rápido

### Prerequisitos
- Node.js 20+
- pnpm 9+
- Docker Desktop
- Android Studio (para TV app)
- Cuenta Supabase

### 1. Clonar y dependencias
```bash
git clone <repo>
cd foodscreen-manager
pnpm install
```

### 2. Configurar variables de entorno
```bash
# Backend
cp .env.example apps/api/.env
# Completar con credenciales de Supabase

# Frontend
cp .env.example apps/admin/.env
# Completar con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

### 3. Sincronizar schema con Supabase
```bash
cd apps/api
pnpm prisma db push
pnpm prisma generate
```

### 4. Desarrollo local
```bash
# Opción A — con Docker
docker-compose -f docker-compose.dev.yml up

# Opción B — sin Docker
pnpm dev
```

- Admin: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

## Apps

- **[apps/admin](./apps/admin/README.md)** — Panel de administración
- **[apps/api](./apps/api/README.md)** — Backend REST API
- **[apps/tv-app](./apps/tv-app/README.md)** — Android TV App
