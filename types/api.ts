export interface MaintenanceTicket {
  id: string;
  property_id: string;
  unit_id?: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_at: string;
}

export interface Company {
  id: string | number;
  name: string;
  code: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  roleScope: string;
  roleScopeKey: string;
  companyId: string;
  company: Company;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
  productCode: string;
}
