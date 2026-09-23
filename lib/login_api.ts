import { apiFetch } from "./api_client";

export interface LoginPayload {
  productCode: string;
  email: string;
  password_hash: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    company_id: string;
    role: string;
  };
}

export async function loginUser(credentials: LoginPayload) {
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("company_id", response.data.user.company_id);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
}
