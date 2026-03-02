import { apiFetch } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type {
  DocumentCategoryDto,
  CreateDocumentCategoryBody,
  UpdateDocumentCategoryBody,
} from '@/types/entities';

export async function fetchDocumentCategories(): Promise<DocumentCategoryDto[]> {
  const res = await apiFetch<{ success: true; data: DocumentCategoryDto[] }>('/document-categories');
  return res.data;
}

export async function fetchDocumentCategoryById(id: number): Promise<DocumentCategoryDto> {
  const res = await apiFetch<{ success: true; data: DocumentCategoryDto }>(`/document-categories/${id}`);
  return res.data;
}

export async function createDocumentCategory(body: CreateDocumentCategoryBody): Promise<DocumentCategoryDto> {
  const res = await apiFetch<{ success: true; data: DocumentCategoryDto }>('/document-categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateDocumentCategory(id: number, body: UpdateDocumentCategoryBody): Promise<DocumentCategoryDto> {
  const res = await apiFetch<{ success: true; data: DocumentCategoryDto }>(`/document-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteDocumentCategory(id: number): Promise<void> {
  await apiFetch<{ success: true }>(`/document-categories/${id}`, { method: 'DELETE' });
}
