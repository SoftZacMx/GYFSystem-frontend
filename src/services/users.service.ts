import { apiFetch } from '@/lib/api-client';
import type { ApiListSuccess, ApiSuccess, ListMeta } from '@/types/api';
import type { UserDto, CreateUserBody, UpdateUserBody } from '@/types/entities';

export interface UsersQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export async function fetchUsers(query: UsersQuery = {}): Promise<{ data: UserDto[]; meta: ListMeta }> {
  const params = new URLSearchParams();
  if (query.page != null) params.set('page', String(query.page));
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order);
  const q = params.toString();
  const res = await apiFetch<ApiListSuccess<UserDto>>(`/users${q ? `?${q}` : ''}`);
  return { data: res.data, meta: res.meta };
}

export async function fetchUserById(id: number): Promise<UserDto> {
  const res = await apiFetch<ApiSuccess<UserDto>>(`/users/${id}`);
  return res.data;
}

export async function createUser(body: CreateUserBody): Promise<UserDto> {
  const res = await apiFetch<ApiSuccess<UserDto>>('/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateUser(id: number, body: UpdateUserBody): Promise<UserDto> {
  const res = await apiFetch<ApiSuccess<UserDto>>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch<ApiSuccess<unknown>>(`/users/${id}`, { method: 'DELETE' });
}
