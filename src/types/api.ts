export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { timestamp: string };
}

export interface ApiListSuccess<T> {
  success: true;
  data: T[];
  meta: ListMeta;
}

export interface ListMeta {
  timestamp: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorPayload {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    details?: unknown;
  };
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
