import { apiFetch } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { CompanyDto, CreateCompanyBody, UpdateCompanyBody } from '@/types/entities';

export interface ThemeConfigDto {
  primaryColor: string | null;
  accentColor: string | null;
}

/** Public: theme config for app bootstrap (no auth). Use on app load so login page has correct theme. */
export async function fetchThemeConfig(): Promise<ThemeConfigDto> {
  const res = await apiFetch<ApiSuccess<ThemeConfigDto>>('/theme');
  return res.data;
}

export async function fetchCompanyById(id: number): Promise<CompanyDto> {
  const res = await apiFetch<ApiSuccess<CompanyDto>>(`/company?id=${id}`);
  return res.data;
}

export async function updateCompany(id: number, body: UpdateCompanyBody): Promise<CompanyDto> {
  const res = await apiFetch<ApiSuccess<CompanyDto>>(`/company?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function createCompany(body: CreateCompanyBody): Promise<CompanyDto> {
  const res = await apiFetch<ApiSuccess<CompanyDto>>('/company', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}
