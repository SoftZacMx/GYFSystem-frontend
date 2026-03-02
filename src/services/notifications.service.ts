import { apiFetch } from '@/lib/api-client';
import type { ApiListSuccess, ApiSuccess, ListMeta } from '@/types/api';
import type { NotificationDto, CreateNotificationBody } from '@/types/entities';

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  userId?: number;
  isRead?: boolean;
  type?: string;
}

export async function fetchMyNotifications(): Promise<NotificationDto[]> {
  const res = await apiFetch<ApiSuccess<NotificationDto[]>>('/notifications/me');
  return res.data;
}

export async function fetchNotifications(query: NotificationsQuery = {}) {
  const params = new URLSearchParams();
  if (query.page != null) params.set('page', String(query.page));
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order ?? 'desc');
  if (query.userId != null) params.set('userId', String(query.userId));
  if (query.isRead != null) params.set('isRead', String(query.isRead));
  if (query.type) params.set('type', query.type);
  const q = params.toString();
  const res = await apiFetch<ApiListSuccess<NotificationDto>>(`/notifications${q ? `?${q}` : ''}`);
  return { data: res.data, meta: res.meta };
}

export async function markNotificationAsRead(id: number): Promise<NotificationDto> {
  const res = await apiFetch<ApiSuccess<NotificationDto>>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return res.data;
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  const res = await apiFetch<ApiSuccess<{ updated: number }>>('/notifications/me/read-all', {
    method: 'PATCH',
  });
  return res.data;
}

export async function createNotification(body: CreateNotificationBody): Promise<NotificationDto> {
  const res = await apiFetch<ApiSuccess<NotificationDto>>('/notifications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await apiFetch<ApiSuccess<unknown>>(`/notifications/${id}`, { method: 'DELETE' });
}
