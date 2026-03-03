import { apiFetch } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';

export interface DashboardStats {
  students: number;
  users: number;
  events: number;
}

export interface DashboardRecentDoc {
  id: number;
  name: string;
}

export interface DashboardChartItem {
  grade: string;
  totalStudents: number;
  studentsWithAllCategories: number;
}

export interface DashboardDto {
  stats: DashboardStats;
  recentDocs: DashboardRecentDoc[];
  chartData: DashboardChartItem[];
}

export async function fetchDashboard(): Promise<DashboardDto> {
  const res = await apiFetch<ApiSuccess<DashboardDto>>('/dashboard');
  return res.data;
}
