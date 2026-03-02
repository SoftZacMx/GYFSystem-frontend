import { apiFetch } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { ParentStudentBody, StudentOfParentDto, ParentOfStudentDto } from '@/types/entities';

export async function associateParentStudent(body: ParentStudentBody): Promise<{ userId: number; studentId: number }> {
  const res = await apiFetch<ApiSuccess<{ userId: number; studentId: number }>>('/parent-students', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function disassociateParentStudent(userId: number, studentId: number): Promise<void> {
  await apiFetch<ApiSuccess<unknown>>(`/parent-students?userId=${userId}&studentId=${studentId}`, {
    method: 'DELETE',
  });
}

export async function fetchStudentsByUserId(userId: number): Promise<StudentOfParentDto[]> {
  const res = await apiFetch<ApiSuccess<StudentOfParentDto[]>>(`/users/${userId}/students`);
  return res.data;
}

export async function fetchParentsByStudentId(studentId: number): Promise<ParentOfStudentDto[]> {
  const res = await apiFetch<ApiSuccess<ParentOfStudentDto[]>>(`/students/${studentId}/parents`);
  return res.data;
}
