import { apiFetch } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { LoginBody, LoginResult } from '@/types/auth';

export async function login(body: LoginBody): Promise<LoginResult> {
  const res = await apiFetch<ApiSuccess<LoginResult>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function me(): Promise<{ sub: number; email: string; roleId: number }> {
  const res = await apiFetch<ApiSuccess<{ sub: number; email: string; roleId: number }>>('/auth/me');
  return res.data;
}
