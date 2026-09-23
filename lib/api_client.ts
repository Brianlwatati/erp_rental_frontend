import { LoginPayload, LoginResponseData, User } from "@/types/api";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://127.0.0.1:5000/api/v1";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Client for General API Endpoints (Port 4000)
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    if (response.status === 401) {
      // await logoutUser(true);
    }
    throw new Error(
      result.message ||
        "An error occurred while communicating with the server.",
    );
  }

  return result;
}

// Dedicated Client for Login / Auth Service (Port 5000)
export async function loginUser(
  credentials: Partial<LoginPayload>,
): Promise<LoginResponseData> {
  const payload: LoginPayload = {
    email: credentials.email || "",
    password: credentials.password || "",
    productCode: "RENTAL",
  };

  const response = await fetch(`${AUTH_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<LoginResponseData> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Login failed. Please check your credentials.",
    );
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", result.data.tokens.accessToken);
    localStorage.setItem("refreshToken", result.data.tokens.refreshToken);
    localStorage.setItem("companyId", result.data.user.companyId);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }

  return result.data;
}

// Logout Utility: Calls http://127.0.0.1:5000/api/v1/auth/logout
export async function logoutUser(redirectToLogin = true) {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        await fetch(`${AUTH_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API request failed:", error);
      }
    }

    // Clear local storage items regardless of network status
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("companyId");
    localStorage.removeItem("user");

    if (redirectToLogin) {
      window.location.href = "/login";
    }
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
