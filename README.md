# Files Manager — Frontend

React + TypeScript + Vite + Tailwind. Consume la API en `../files-manager-api`.

## Requisitos

- Node 18+
- API backend corriendo (por defecto `http://localhost:3000`)

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta si hace falta:

```
VITE_API_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173. Login con un usuario existente en la API.

## Build

```bash
npm run build
```

Salida en `dist/`.

## Estructura

- `src/lib` — Cliente API, env
- `src/types` — Tipos (API, auth, entidades)
- `src/services` — Llamadas por dominio (auth, users, students, catalogs)
- `src/contexts` — Theme, Auth
- `src/theme` — Paleta desde color base (color2k), persistencia en localStorage
- `src/pages` — Login, Dashboard, Usuarios, Estudiantes
- `src/components` — ProtectedRoute, ThemePicker

Las fases completas y referencias al backend están en `docs/FRONTEND_PROMPT.md`.
