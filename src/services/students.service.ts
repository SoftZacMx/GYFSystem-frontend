import { apiFetch } from '@/lib/api-client';
import type { ApiListSuccess, ApiSuccess, ListMeta } from '@/types/api';
import type { StudentDto, CreateStudentBody, UpdateStudentBody } from '@/types/entities';

export interface StudentsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export async function fetchStudents(query: StudentsQuery = {}) {
  const params = new URLSearchParams();
  if (query.page != null) params.set('page', String(query.page));
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order);
  const q = params.toString();
  const res = await apiFetch<ApiListSuccess<StudentDto>>(`/students${q ? `?${q}` : ''}`);
  return { data: res.data, meta: res.meta };
}

/** Alumnos asociados al usuario actual (requiere auth). Usar en selector de subida para no-admin. */
export async function fetchMyStudents(): Promise<StudentDto[]> {
  const res = await apiFetch<ApiSuccess<StudentDto[]>>('/students/me');
  return res.data;
}

export async function fetchStudentById(id: number): Promise<StudentDto> {
  const res = await apiFetch<ApiSuccess<StudentDto>>(`/students/${id}`);
  return res.data;
}

export async function createStudent(body: CreateStudentBody): Promise<StudentDto> {
  const res = await apiFetch<ApiSuccess<StudentDto>>('/students', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateStudent(id: number, body: UpdateStudentBody): Promise<StudentDto> {
  const res = await apiFetch<ApiSuccess<StudentDto>>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteStudent(id: number): Promise<void> {
  await apiFetch<ApiSuccess<unknown>>(`/students/${id}`, { method: 'DELETE' });
}
