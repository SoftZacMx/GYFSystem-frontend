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

export async function verifyAccount(token: string): Promise<{ message: string }> {
  const res = await apiFetch<ApiSuccess<{ message: string }>>(
    `/auth/account/verify?${new URLSearchParams({ token })}`
  );
  return res.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<ApiSuccess<{ message: string }>>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiFetch<ApiSuccess<{ message: string }>>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
