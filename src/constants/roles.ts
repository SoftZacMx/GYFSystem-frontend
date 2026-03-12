import type { CatalogItem } from '@/types/entities';

/** Etiquetas para mostrar en UI; la key es el nombre del rol que viene del API */
const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

export type RoleOption = { key: number; value: string };

/**
 * Convierte la lista de roles del API en opciones para el select:
 * key = id del rol (se envía al backend), value = etiqueta a mostrar.
 */
export function getRoleOptions(roles: CatalogItem[]): RoleOption[] {
  return roles.map((r) => ({
    key: r.id,
    value: ROLE_LABELS[r.name] ?? r.name,
  }));
}

/** Devuelve la etiqueta de un rol por su id (útil cuando solo tienes roleId y la lista de roles). */
export function getRoleLabel(roleId: number, roles: CatalogItem[]): string {
  const role = roles.find((r) => r.id === roleId);
  return role ? ROLE_LABELS[role.name] ?? role.name : '';
}
