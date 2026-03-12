export interface UserDto {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  roleId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  userTypeId: number;
  roleId: number;
  status: string;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
  userTypeId?: number;
  roleId?: number;
  status?: string;
}

export interface StudentFileItem {
  category: string;
  isUpload: boolean;
}

export interface StudentDto {
  id: number;
  fullName: string;
  curp: string;
  grade: string;
  status: string;
  createdAt: string;
  files: StudentFileItem[];
  totalUploadFiles: number;
  totalPendingFiles: number;
}

export interface CreateStudentBody {
  fullName: string;
  curp: string;
  grade: string;
  status: string;
}

export interface UpdateStudentBody {
  fullName?: string;
  curp?: string;
  grade?: string;
  status?: string;
}

export interface DocumentCategoryDto {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateDocumentCategoryBody {
  name: string;
  description?: string | null;
}

export interface UpdateDocumentCategoryBody {
  name?: string;
  description?: string | null;
}

export interface DocumentDto {
  id: number;
  studentId: number;
  categoryId: number;
  uploadedBy: number;
  fileUrl: string;
  signatureHash: string | null;
  uploadedAt: string;
  verifiedAt?: string | null;
  verified?: boolean;
}

export interface EventDto {
  id: number;
  createdBy: number;
  title: string;
  description: string | null;
  eventDate: string;
  createdAt: string;
}

export interface CreateEventBody {
  title: string;
  description?: string | null;
  eventDate: string;
}

export interface UpdateEventBody {
  title?: string;
  description?: string | null;
  eventDate?: string;
}

export interface NotificationDto {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  documentId: number | null;
  eventId: number | null;
  createdAt: string;
}

export interface CompanyThemeConfig {
  primaryColor?: string;
  accentColor?: string;
}

export interface CompanyDto {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  timezone: string | null;
  themeConfig: CompanyThemeConfig | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyBody {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  timezone?: string | null;
  themeConfig?: CompanyThemeConfig | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
}

export interface UpdateCompanyBody {
  name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  timezone?: string | null;
  themeConfig?: CompanyThemeConfig | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
}

export interface CatalogItem {
  id: number;
  name: string;
}

export interface StudentOfParentDto {
  studentId: number;
  fullName: string;
  curp: string;
  grade: string;
  status: string;
}

export interface ParentOfStudentDto {
  userId: number;
  name: string;
  email: string;
}

export interface ParentStudentBody {
  userId: number;
  studentId: number;
}

export interface CreateNotificationBody {
  userId: number;
  message: string;
  type: 'info' | 'warning' | 'document' | 'event';
  documentId?: number | null;
  eventId?: number | null;
}
