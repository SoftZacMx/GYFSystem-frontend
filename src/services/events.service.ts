import { apiFetch } from '@/lib/api-client';
import type { ApiListSuccess, ApiSuccess } from '@/types/api';
import type { EventDto, CreateEventBody, UpdateEventBody } from '@/types/entities';

export interface EventsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  createdBy?: number;
}

export async function fetchEvents(query: EventsQuery = {}) {
  const params = new URLSearchParams();
  if (query.page != null) params.set('page', String(query.page));
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order ?? 'desc');
  if (query.createdBy != null) params.set('createdBy', String(query.createdBy));
  const q = params.toString();
  const res = await apiFetch<ApiListSuccess<EventDto>>(`/events${q ? `?${q}` : ''}`);
  return { data: res.data, meta: res.meta };
}

export async function fetchEventById(id: number): Promise<EventDto> {
  const res = await apiFetch<ApiSuccess<EventDto>>(`/events/${id}`);
  return res.data;
}

export async function createEvent(body: CreateEventBody): Promise<EventDto> {
  const res = await apiFetch<ApiSuccess<EventDto>>('/events', { method: 'POST', body: JSON.stringify(body) });
  return res.data;
}

export async function updateEvent(id: number, body: UpdateEventBody): Promise<EventDto> {
  const res = await apiFetch<ApiSuccess<EventDto>>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  return res.data;
}

export async function deleteEvent(id: number): Promise<void> {
  await apiFetch<ApiSuccess<unknown>>(`/events/${id}`, { method: 'DELETE' });
}
