# Prompt de desarrollo — Files Manager Frontend

Este documento define las **fases**, **tareas** y **referencias al backend** para construir el frontend. **El backend es la fuente de verdad**: todas las interfaces, contratos de API y reglas de negocio deben alinearse con la API existente en `../files-manager-api`.

---

## 1. Referencia al backend

- **Proyecto API:** `../files-manager-api` (o ruta absoluta según tu workspace).
- **Base URL API:** Configurable por entorno (ej. `VITE_API_URL`, por defecto `http://localhost:3000`).
- **Autenticación:** JWT en cabecera `Authorization: Bearer <token>`. El token se obtiene con `POST /auth/login`; las rutas protegidas requieren este header.
- **Contrato de respuestas:**
  - **Éxito (recurso):** `{ success: true, data: T, meta?: { timestamp: string } }`
  - **Éxito (lista paginada):** `{ success: true, data: T[], meta: { timestamp, page, limit, total, totalPages } }`
  - **Error:** `{ success: false, error: { message: string, code: string, details?: unknown } }`
  - **Códigos de error del backend:** `VALIDATION_ERROR`, `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE_ENTITY`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`

Revisar en el backend cuando haya dudas:
- `files-manager-api/src/views/` (respuestas y tipos de error).
- `files-manager-api/src/services/*.ts` (DTOs exportados: `UserDto`, `StudentDto`, etc.).
- `files-manager-api/src/validators/*.ts` (tipos de body y query).
- `files-manager-api/src/config/jwt.ts` (`AccessTokenPayload`: `sub`, `email`, `roleId`).
- `files-manager-api/src/routes/*.routes.ts` (qué rutas llevan `authMiddleware`).

---

## 2. Endpoints del backend (referencia para servicios del frontend)

A continuación se listan los endpoints que el frontend debe consumir. Crear **un módulo de API/servicios por dominio** que mapee a estos endpoints y use los tipos indicados.

### 2.1 Auth (sin token)

| Método | Ruta | Body | Respuesta `data` |
|--------|------|------|------------------|
| POST | `/auth/login` | `{ email: string, password: string }` | `LoginResult`: `{ token: string, user: { id, name, email, roleId, userTypeId, status } }` |
| GET | `/auth/me` | — | **Requiere token.** `AccessTokenPayload`: `{ sub, email, roleId }` (o usuario ampliado según backend) |

### 2.2 User types (catálogo, sin auth en backend)

| Método | Ruta | Respuesta `data` |
|--------|------|------------------|
| GET | `/user-types` | `{ id: number, name: string }[]` |
| GET | `/user-types/:id` | `{ id: number, name: string }` |

### 2.3 Roles (catálogo, sin auth en backend)

| Método | Ruta | Respuesta `data` |
|--------|------|------------------|
| GET | `/roles` | `{ id: number, name: string }[]` |
| GET | `/roles/:id` | `{ id: number, name: string }` |

### 2.4 Users (CRUD; en backend sin auth en rutas actuales)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| GET | `/users` | Query: `page`, `limit`, `sortBy`, `order` (opcionales) | Lista paginada: `UserDto[]` + `meta` |
| GET | `/users/:id` | — | `UserDto`: `{ id, name, email, userTypeId, roleId, status, createdAt, updatedAt }` |
| POST | `/users` | `CreateUserBody`: name, email, password, userTypeId, roleId, status | `UserDto` |
| PUT | `/users/:id` | `UpdateUserBody`: todos opcionales (name, email, password, userTypeId, roleId, status) | `UserDto` |
| DELETE | `/users/:id` | — | sin body (204 o 200) |

### 2.5 Students (CRUD; sin auth en backend)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| GET | `/students` | Query: `page`, `limit`, `sortBy`, `order` (sortBy: id, fullName, curp, grade, status, createdAt) | Lista paginada: `StudentDto[]` + `meta` |
| GET | `/students/:id` | — | `StudentDto`: `{ id, fullName, curp, grade, status, createdAt }` |
| POST | `/students` | `CreateStudentBody`: fullName, curp (18 chars CURP), grade, status | `StudentDto` |
| PUT | `/students/:id` | `UpdateStudentBody`: fullName?, curp?, grade?, status? | `StudentDto` |
| DELETE | `/students/:id` | — | sin body |

### 2.6 Document categories (CRUD; sin auth en backend)

| Método | Ruta | Body | Respuesta `data` |
|--------|------|------|------------------|
| GET | `/document-categories` | — | `DocumentCategoryDto[]`: `{ id, name, description }` |
| GET | `/document-categories/:id` | — | `DocumentCategoryDto` |
| POST | `/document-categories` | `CreateDocumentCategoryBody`: name, description? | `DocumentCategoryDto` |
| PUT | `/document-categories/:id` | `UpdateDocumentCategoryBody`: name?, description? | `DocumentCategoryDto` |
| DELETE | `/document-categories/:id` | — | sin body |

### 2.7 Parent–Student (asociaciones; sin auth en backend)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| POST | `/parent-students` | `ParentStudentBody`: `{ userId, studentId }` | `ParentStudentDto`: `{ userId, studentId }` |
| DELETE | `/parent-students` | Query: `userId`, `studentId` | sin body |
| GET | `/users/:userId/students` | — | `StudentOfParentDto[]`: `{ studentId, fullName, curp, grade, status }` |
| GET | `/students/:studentId/parents` | — | `ParentOfStudentDto[]`: `{ userId, name, email }` |

### 2.8 Documents (con auth en backend salvo verify/qr)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| GET | `/documents` | Query: `page`, `limit`, `sortBy`, `order`, `studentId?`, `categoryId?` | Lista paginada: `DocumentDto[]` + `meta` |
| GET | `/documents/:id` | — | **Auth.** `DocumentDto`: `{ id, studentId, categoryId, uploadedBy, fileUrl, signatureHash, uploadedAt }` |
| GET | `/documents/:id/verify` | — | **Público.** `{ valid: boolean, document: DocumentDto, verifyUrl: string }` |
| GET | `/documents/:id/qr` | — | **Público.** Imagen QR (o URL según backend) |
| POST | `/documents` | **Auth.** `CreateDocumentBody`: studentId, categoryId, fileUrl, signatureHash? | `DocumentDto` |
| POST | `/documents/upload` | **Auth.** `multipart/form-data`: `file` + campos `studentId`, `categoryId`, `sign` ('true'\|'false') | `DocumentDto` (o según backend) |
| DELETE | `/documents/:id` | — | **Auth.** sin body |

### 2.9 Events (con auth en backend)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| GET | `/events` | Query: `page`, `limit`, `sortBy`, `order`, `createdBy?` | Lista paginada: `EventDto[]` + `meta` |
| GET | `/events/:id` | — | `EventDto`: `{ id, createdBy, title, description, eventDate, createdAt }` |
| POST | `/events` | `CreateEventBody`: title, description?, eventDate (ISO) | `EventDto` |
| PUT | `/events/:id` | `UpdateEventBody`: title?, description?, eventDate? | `EventDto` |
| DELETE | `/events/:id` | — | sin body |

### 2.10 Notifications (con auth en backend)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| GET | `/notifications/me` | — | Lista de notificaciones del usuario actual (contrato según backend) |
| GET | `/notifications` | Query: `page`, `limit`, `sortBy`, `order`, `userId?`, `isRead?`, `type?` | Lista paginada: `NotificationDto[]` + `meta` |
| GET | `/notifications/:id` | — | `NotificationDto`: `{ id, userId, message, type, isRead, documentId, eventId, createdAt }` |
| POST | `/notifications` | `CreateNotificationBody`: userId, message, type ('info'\|'warning'\|'document'\|'event'), documentId?, eventId? | `NotificationDto` |
| PATCH | `/notifications/:id/read` | — | `NotificationDto` (isRead: true) |
| PATCH | `/notifications/me/read-all` | — | `{ updated: number }` (o según backend) |
| DELETE | `/notifications/:id` | — | sin body |

### 2.11 Company (con auth en backend)

| Método | Ruta | Body / Query | Respuesta `data` |
|--------|------|--------------|------------------|
| GET | `/company` | Query: **`id` (requerido)** | `CompanyDto`: `{ id, name, email, phone, address, logoUrl, timezone, createdAt, updatedAt }` |
| PUT | `/company` | Query: **`id` (requerido)**. Body: `UpdateCompanyBody` (name?, email?, phone?, address?, logoUrl?, timezone?) | `CompanyDto` |
| POST | `/company` | Body: `CreateCompanyBody`: name, email, phone?, address?, logoUrl?, timezone? | `CompanyDto` |

---

## 3. Tipos e interfaces a crear en el frontend (espejo del backend)

Definir en el frontend tipos equivalentes a los del backend para request/response y listas paginadas. Usar como referencia:

- **Auth:** `LoginBody`, `LoginResult`, `AccessTokenPayload` (o el shape de `/auth/me`).
- **User:** `UserDto`, `CreateUserBody`, `UpdateUserBody`; paginación con `page`, `limit`, `sortBy`, `order`.
- **Student:** `StudentDto`, `CreateStudentBody`, `UpdateStudentBody`; query con sortBy permitidos.
- **Document category:** `DocumentCategoryDto`, `CreateDocumentCategoryBody`, `UpdateDocumentCategoryBody`.
- **Document:** `DocumentDto`, `CreateDocumentBody`, query con `studentId`, `categoryId`; upload con `studentId`, `categoryId`, `sign`.
- **Event:** `EventDto`, `CreateEventBody`, `UpdateEventBody`; query con `createdBy`.
- **Notification:** `NotificationDto`, `CreateNotificationBody`; query con `userId`, `isRead`, `type`; tipos: `'info' | 'warning' | 'document' | 'event'`.
- **Company:** `CompanyDto`, `CreateCompanyBody`, `UpdateCompanyBody`; GET/PUT con query `id`.
- **Parent–Student:** `ParentStudentBody`, `ParentStudentDto`, `StudentOfParentDto`, `ParentOfStudentDto`.
- **Común:** `ListMeta` (page, limit, total, totalPages, timestamp), `ErrorPayload` (message, code, details?), `ApiSuccess<T>`, `ApiListSuccess<T>`, `ApiError`.

---

## 4. Principios y arquitectura (alineados al backend)

- **Capas claras:** UI (páginas/componentes) → hooks o casos de uso → servicios de API. No poner lógica de negocio en componentes.
- **Un solo lugar para el contrato API:** Servicios (o cliente HTTP) que concentren llamadas al backend; tipos compartidos para request/response.
- **Manejo de errores unificado:** Interceptar respuestas `success: false`, mapear `error.code` a mensajes o acciones (ej. 401 → logout, 404 → not found).
- **SOLID en frontend:** Servicios inyectables o estáticos por dominio; componentes con una responsabilidad; hooks reutilizables para datos y formularios.
- **Buenas prácticas React:** Componentes funcionales, hooks para estado y efectos, evitar lógica pesada en render; listas con keys estables; accesibilidad (a11y) en formularios y navegación.

---

## 5. Stack técnico

- **React** (con TypeScript).
- **Tailwind CSS** para estilos.
- **shadcn/ui** para componentes de UI (Button, Input, Card, Table, Dialog, Form, etc.). Instalar y usar según [documentación shadcn](https://ui.shadcn.com/).
- **Toast (mensajes emergentes):** Usar **toast** para informar al usuario de forma no intrusiva: éxito (ej. “Guardado”, “Eliminado”), errores de API (mensaje de `error.message`), validaciones y avisos. Recomendado: el componente **Sonner** de shadcn (`npx shadcn@latest add sonner`) para mantener coherencia con el resto de la UI. Mostrar toast en respuestas de mutaciones (create, update, delete) y al recibir `success: false` del backend.
- **Cliente HTTP:** `fetch` o librería (axios/fetch wrapper) con base URL configurable; cabecera `Authorization` en rutas protegidas.
- **Estado y caché:** A criterio (Context, Zustand, TanStack Query, etc.), manteniendo servicios de API como única fuente de llamadas al backend.
- **Routing:** React Router (o similar) para rutas públicas (login) y protegidas (dashboard, módulos).
- **Tema y paleta de colores:** Variables CSS para toda la UI; paleta generada desde **un color base** elegido por el usuario, usando una librería (recomendado **culor** o **color2k**) para obtener la escala (50–950). Persistencia del tema (color base y opcionalmente modo claro/oscuro) en `localStorage`. Las clases siguen siendo semánticas (`bg-primary`, `text-primary-foreground`); lo que cambia son los valores de las variables CSS inyectadas en `:root`.

---

## 6. Fases y tareas

Implementar en este orden, tomando siempre el backend como referencia.

### Fase 1 — Proyecto base
- Inicializar proyecto React + TypeScript (Vite recomendado).
- Configurar Tailwind y shadcn/ui; añadir componente **Sonner** para toasts (`npx shadcn@latest add sonner`).
- Definir variable de entorno para la base URL del API (ej. `VITE_API_URL`).
- Crear cliente HTTP base: función que envíe peticiones, lea JSON, y en caso de `success: false` lance o devuelva un error tipado (`ApiError`).
- Definir tipos globales de API: `ApiSuccess<T>`, `ApiListSuccess<T>`, `ApiError`, `ListMeta`, `ErrorPayload`.

### Fase 2 — Tema y paleta de colores
- Instalar librería para manipulación de color: **culor** o **color2k** (generar escalas lighten/darken desde un color base).
- Definir variables CSS semánticas en `:root` (o en un tema) alineadas con shadcn: `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, etc., y escalas si aplica (`--primary-50` … `--primary-950`).
- Crear lógica que, dado un **color base** (hex) elegido por el usuario, genere la paleta (p. ej. 9–11 tonos por luminosidad) y asigne los valores a las variables CSS (inyección en `document.documentElement.style` o en un `<style>` dinámico).
- Pantalla o modal de “Personalizar tema”: selector de color (input type color o picker); al elegir, generar paleta, aplicar variables y guardar en **localStorage** (color base y, si se implementa, modo claro/oscuro). Al cargar la app, leer de localStorage y aplicar el tema antes de pintar la UI.
- Opcional: modo claro/oscuro que ajuste background/foreground manteniendo el color de acento.

### Fase 3 — Auth
- Pantalla de login (email, password); POST `/auth/login`; guardar token (ej. localStorage o memoria) y usuario.
- Añadir al cliente HTTP la cabecera `Authorization: Bearer <token>` cuando exista token.
- Ruta protegida: si no hay token (o 401), redirigir a login.
- Opcional: GET `/auth/me` al iniciar para validar token y obtener usuario actual.
- Tipos: `LoginBody`, `LoginResult`, usuario actual (según `/auth/me`).

### Fase 4 — Catálogos (user-types, roles)
- Servicio API: GET `/user-types`, GET `/user-types/:id`; tipos `{ id, name }`.
- Servicio API: GET `/roles`, GET `/roles/:id`; tipos `{ id, name }`.
- Uso: listas desplegables en formularios (usuarios, etc.) sin pantallas propias si no se requiere; o pantallas de solo lectura si se pide.

### Fase 5 — Usuarios
- Servicio API: CRUD usuarios según §2.4; tipos `UserDto`, `CreateUserBody`, `UpdateUserBody`; paginación.
- Listado paginado de usuarios (tabla); filtros/orden según query del backend.
- Alta de usuario (formulario con userTypeId, roleId desde catálogos).
- Edición y eliminación de usuario; manejo de errores (CONFLICT por email, NOT_FOUND).

### Fase 6 — Estudiantes
- Servicio API: CRUD estudiantes según §2.5; tipos `StudentDto`, `CreateStudentBody`, `UpdateStudentBody`; validación CURP en frontend (opcional pero recomendable).
- Listado paginado; ordenación por fullName, curp, grade, status, createdAt.
- Alta, edición y eliminación de estudiantes.

### Fase 7 — Categorías de documentos
- Servicio API: CRUD document-categories según §2.6; tipos `DocumentCategoryDto`, `CreateDocumentCategoryBody`, `UpdateDocumentCategoryBody`.
- Listado y formularios de alta/edición; eliminación con confirmación.

### Fase 8 — Documentos
- Servicio API: listado, por id, upload, delete según §2.8; tipos `DocumentDto`, query, upload (multipart con studentId, categoryId, sign).
- Listado paginado con filtros studentId, categoryId; enlaces a ver/descargar y a verificación pública (`/documents/:id/verify`, `/documents/:id/qr`).
- Pantalla de subida: formulario con estudiante, categoría, archivo y opción “firmar”; POST `/documents/upload` (multipart).
- Eliminación (soft delete) con confirmación.

### Fase 9 — Eventos
- Servicio API: CRUD eventos según §2.9; tipos `EventDto`, `CreateEventBody`, `UpdateEventBody`; paginación y filtro `createdBy`.
- Listado paginado; alta y edición de eventos (título, descripción, fecha).

### Fase 10 — Notificaciones
- Servicio API: según §2.10; tipos `NotificationDto`, `CreateNotificationBody`; GET `/notifications/me`, mark read, read-all.
- Listado de notificaciones del usuario actual; marcar como leída / marcar todas; opcional: creación de notificación si el backend lo expone a usuarios.

### Fase 11 — Company
- Servicio API: GET `/company?id=`, PUT `/company?id=`, POST `/company` según §2.11; tipos `CompanyDto`, `CreateCompanyBody`, `UpdateCompanyBody`.
- Pantalla de configuración de empresa: si existe company, GET por id y formulario de edición (PUT); si no, formulario de creación (POST). Campos: name, email, phone, address, logoUrl, timezone.

### Fase 12 — Parent–Student (asociaciones)
- Servicio API: según §2.7; asociar/desasociar; listar estudiantes por usuario y padres por estudiante.
- UI: en ficha de usuario, listar sus estudiantes y permitir asociar/desasociar; en ficha de estudiante, listar padres y permitir asociar/desasociar.

### Fase 13 — Ajustes y calidad
- Revisar que todos los errores del API se muestren de forma consistente mediante **toast** (mensaje, y código si aporta).
- Revisar rutas públicas vs protegidas y que el token se envíe solo donde el backend lo exige.
- Ajustes de UX: loading, **toast de éxito** en create/update/delete, toast de error en fallos de API, validaciones en formularios.
- Documentar en este repo cualquier desvío del backend o convenciones propias del frontend.

---

## 7. Resumen de referencias rápidas al backend

| Necesidad | Dónde mirar en el backend |
|-----------|----------------------------|
| Formato de respuestas y errores | `src/views/` (response.helper, types) |
| DTOs de cada recurso | `src/services/*Service.ts` (export interface XxxDto) |
| Body y query de cada endpoint | `src/validators/*.ts` (CreateXxxBody, UpdateXxxBody, XxxQuery) |
| Rutas y métodos HTTP | `src/routes/*.routes.ts` |
| Qué rutas llevan auth | Presencia de `authMiddleware` en la ruta |
| Payload del token | `src/config/jwt.ts` (AccessTokenPayload), respuesta de login |

Siempre que se añada un endpoint o se cambie un tipo en el backend, actualizar este documento y los servicios/tipos del frontend para mantener el contrato alineado.
