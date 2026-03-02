# Files Manager — Frontend

Aplicación web del **Files Manager**: gestión de documentos, estudiantes, usuarios, eventos, notificaciones y empresa. Desarrollada con React 19, TypeScript, Vite y Tailwind CSS. Consume la API en `../files-manager-api`.

## Requisitos

- **Node.js** 18+
- **API backend** en ejecución (por defecto `http://localhost:3000`)

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta la URL del API si es necesario:

```env
VITE_API_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Inicia sesión con un usuario existente en la API.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compila para producción (TypeScript + Vite) |
| `npm run preview` | Sirve la carpeta `dist/` localmente |
| `npm run lint` | ESLint |

La salida de build queda en `dist/`.

## Estructura del proyecto

| Carpeta / archivo | Descripción |
|-------------------|-------------|
| `src/lib` | Cliente API (`api-client`), env (`env.ts`) |
| `src/types` | Tipos compartidos (API, auth, entidades) |
| `src/contexts` | `ThemeContext`, `AuthContext` |
| `src/pages` | Páginas: Login, Dashboard, Usuarios, Estudiantes, Documentos, Categorías, Eventos, Notificaciones, Empresa, Más |
| `src/components` | `Layout`, `BottomNav`, `ProtectedRoute`, `RoleProtectedRoute`, `ThemePicker`, `ListScreenLayout` |
| `src/theme` | Paleta (color2k), persistencia en `localStorage` |

## Rutas principales

- `/login` — Inicio de sesión
- `/` — Dashboard (protegida)
- `/users`, `/users/new`, `/users/:id` — Usuarios (protegida por rol)
- `/students`, `/students/new`, `/students/:id` — Estudiantes (protegida por rol)
- `/document-categories` — Categorías de documentos
- `/documents` — Documentos
- `/events` — Eventos
- `/notifications` — Notificaciones
- `/company` — Datos de la empresa
- `/more` — Más opciones (protegida por rol)

La autenticación es por JWT; el cliente envía el token en `Authorization: Bearer <token>`.

## Documentación

- **Guía de inicialización (IA y desarrolladores):** `docs/INITIALIZATION_GUIDE.md` — configuración paso a paso y despliegue.
- **Prompt frontend:** `docs/FRONTEND_PROMPT.md` (convenciones, fases, referencia al backend).
# GYFSystem-frontend
