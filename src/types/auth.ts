export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  userTypeId: number;
  status: string;
}

export interface LoginResult {
  token: string;
  user: LoginUser;
}

export interface AccessTokenPayload {
  sub: number;
  email: string;
  roleId: number;
  iat?: number;
  exp?: number;
}

/** roleId 1 = admin, 2 = editor (docente). Only they can access users, students, more and create events. */
export function isStaffRole(roleId: number): boolean {
  return roleId === 1 || roleId === 2;
}
