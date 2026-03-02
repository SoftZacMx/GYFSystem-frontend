import { apiFetch } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { CatalogItem } from '@/types/entities';

export async function fetchUserTypes(): Promise<CatalogItem[]> {
  const res = await apiFetch<ApiSuccess<CatalogItem[]>>('/user-types');
  return res.data;
}

export async function fetchRoles(): Promise<CatalogItem[]> {
  const res = await apiFetch<ApiSuccess<CatalogItem[]>>('/roles');
  return res.data;
}
