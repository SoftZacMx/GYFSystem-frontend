import { apiFetch, apiUpload, getStoredToken } from '@/lib/api-client';
import type { ApiListSuccess, ApiSuccess } from '@/types/api';
import type { DocumentDto } from '@/types/entities';
import { getApiUrl } from '@/lib/env';

export interface DocumentGroupStudent {
  studentId: number;
  fullName: string;
  curp: string;
  grade: string;
  status: string;
}

export interface DocumentsGroupedByStudent {
  student: DocumentGroupStudent;
  documents: DocumentDto[];
}

export async function fetchDocumentsGroupedByMyStudents(): Promise<DocumentsGroupedByStudent[]> {
  const res = await apiFetch<ApiSuccess<{ groups: DocumentsGroupedByStudent[] }>>('/documents/me/grouped');
  return res.data.groups;
}

export type DocumentsQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  studentId?: number;
  categoryId?: number;
};

export async function fetchDocuments(query: DocumentsQuery = {}) {
  const p = new URLSearchParams();
  if (query.page != null) p.set('page', String(query.page));
  if (query.limit != null) p.set('limit', String(query.limit));
  if (query.sortBy) p.set('sortBy', query.sortBy);
  if (query.order) p.set('order', query.order ?? 'desc');
  if (query.studentId != null) p.set('studentId', String(query.studentId));
  if (query.categoryId != null) p.set('categoryId', String(query.categoryId));
  const q = p.toString();
  const res = await apiFetch<ApiListSuccess<DocumentDto>>('/documents' + (q ? '?' + q : ''));
  return { data: res.data, meta: res.meta };
}

export async function fetchDocumentById(id: number): Promise<DocumentDto> {
  const res = await apiFetch<ApiSuccess<DocumentDto>>('/documents/' + id);
  return res.data;
}

export async function uploadDocument(file: File, studentId: number, categoryId: number, sign: boolean): Promise<DocumentDto> {
  const form = new FormData();
  form.append('file', file);
  form.append('studentId', String(studentId));
  form.append('categoryId', String(categoryId));
  form.append('sign', sign ? 'true' : 'false');
  const res = await apiUpload<ApiSuccess<DocumentDto>>('/documents/upload', form);
  return res.data;
}

export async function deleteDocument(id: number): Promise<void> {
  await apiFetch<ApiSuccess<unknown>>('/documents/' + id, { method: 'DELETE' });
}

/**
 * Downloads a document via the API (sends auth) and triggers the browser save dialog.
 */
export async function downloadDocument(id: number, suggestedFileName?: string): Promise<void> {
  const base = getApiUrl();
  const url = `${base}/documents/${id}/download`;
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(res.statusText || 'Error al descargar');
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const fileName =
    (disposition?.match(/filename="?([^";]+)"?/)?.[1]?.trim()) ||
    suggestedFileName ||
    `document-${id}`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export interface VerifyResult {
  valid: boolean;
  message: string;
}

export async function verifyDocument(id: number): Promise<VerifyResult> {
  const res = await apiFetch<ApiSuccess<{ valid: boolean; message: string }>>('/documents/' + id + '/verify');
  return { valid: res.data.valid, message: res.data.message };
}

export function getVerifyUrl(id: number): string {
  return getApiUrl() + '/documents/' + id + '/verify';
}

export function getQrUrl(id: number): string {
  return getApiUrl() + '/documents/' + id + '/qr';
}
