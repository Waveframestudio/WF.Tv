<div align="center">

# 📺 FoodScreen TV
### Plataforma SaaS de Señalética Digital & Menús Dinámicos de Alta Performance

[![Architecture](https://img.shields.io/badge/Architecture-Monorepo-6366f1?style=for-the-badge&logo=monorepo)](https://github.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-06b6d4?style=for-the-badge&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-NestJS_%7C_Prisma-ea580c?style=for-the-badge&logo=nestjs)](https://nestjs.com)
[![TV Client](https://img.shields.io/badge/TV_Client-Android_TV_%7C_Kotlin-32de84?style=for-the-badge&logo=android)](https://developer.android.com/tv)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_%7C_Supabase-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)

---

**FoodScreen TV** es la solución inteligente de señalética digital y menús dinámicos diseñada para cadenas gastronómicas, restaurantes y comercios modernos. Permite desplegar contenido promocional de alto impacto visual, sincronizar precios en tiempo real y gestionar de forma centralizada cientos de pantallas desde un único panel intuitivo.

</div>

---

## ✨ Características Destacadas

### 🎨 Editor Canvásico de Overlays
- **Superposición Dinámica de Capas:** Diseña menús y ofertas superponiendo texto, precios y promociones en tiempo real sobre videos en alta definición.
- **Posicionamiento Visual Intuitivo:** Ajusta posiciones, tipografías, colores, opacidades y bordes con arrastre interactivo (*Drag & Drop*).
- **Sincronización en Lote:** Publica cambios visuales instantáneamente a todas las pantallas asignadas.

### 📱 Cliente Android TV de Alta Performance
- **Reproducción Fluida y Sin Cortes:** Basado en **ExoPlayer**, garantiza transiciones limpias y decodificación por hardware sin parpadeos (*zero-flicker*).
- **Resiliencia & Reproducción Offline:** Integración con **Room DB** y **WorkManager** para mantener la emisión en vivo activa incluso ante caídas de internet.
- **Heartbeat & Telemetría:** Monitoreo constante de estado (*Online, Syncing, Offline*) y auditoría de logs de reproducción por dispositivo.

### 📊 Dashboard de Control Centralizado
- **Gestión Multi-Sucursal:** Controla múltiples locales y zonas de emisión con roles y permisos unificados.
- **Librería Multimedia Avanzada:** Carga directa a **Supabase Storage** mediante URLs prefirmadas seguras (*Signed Upload URLs*).
- **Publicación con Snapshots Inmutables:** Crea versiones históricas de playlists para auditar el contenido emitido.

---

## ⚡ Stack Tecnológico

| Módulo | Tecnología | Rol en el Ecosistema |
|---|---|---|
| **Admin Dashboard** | React 18 · Vite · TailwindCSS · Zustand | Panel administrativo con interfaz ultra fluida y diseño *Glassmorphism*. |
| **Core API** | NestJS · TypeScript · Swagger Docs | API REST robusta con validación DTO global y autenticación JWT. |
| **ORM & DB** | Prisma ORM · PostgreSQL · Supabase | Modelado relacional optimizado y escalable. |
| **TV Player App** | Android Native (Kotlin) · ExoPlayer · Room | Cliente reproductor ligero optimizado para TV Boxes y Smart TVs. |
| **Shared Core** | Monorepo Shared Types (`@foodscreen/shared-types`) | Tipado TypeScript unificado de extremo a extremo en todo el monorepo. |

---

## 🛡️ Arquitectura & Filosofía de Diseño

- **Emisión Ininterrumpida (*Zero Downtime*):** Si la conectividad decae, la app del TV Box mantiene el contenido en almacenamiento local y reintenta la sincronización sin interrumpir la pantalla.
- **Carga Directa a Storage:** Los videos de gran tamaño se suben directamente desde el navegador a Supabase Storage con credenciales efímeras, liberando carga de procesador en el servidor backend.
- **API First & Swagger Docs:** Documentación interactiva basada en estándar OpenAPI (`/api/docs`), lista para integraciones con sistemas POS (Puntos de Venta) e inventario.

---

<div align="center">

*Diseñado para ofrecer experiencias visuales inolvidables en pantalla.*

</div>
