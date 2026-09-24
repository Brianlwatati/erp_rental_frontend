import { LoginPayload, LoginResponseData, User } from "@/types/api";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function requireApiUrl(value: string | undefined, name: string): string {
  if (value) return value.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") {
    return name === "NEXT_PUBLIC_AUTH_URL"
      ? "http://127.0.0.1:5000/api/v1"
      : "http://127.0.0.1:4000/api/v1";
  }
  throw new Error(`${name} is not configured.`);
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function clearClientData() {
  if (typeof window === "undefined") return;

  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Storage can be unavailable in private browsing modes.
  }

  try {
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0]?.trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  } catch {
    // Cookie access can be blocked by browser privacy settings.
  }

  try {
    if (window.caches) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    }
  } catch {
    // Cache Storage is optional and should not prevent redirecting.
  }

  try {
    if (window.indexedDB?.databases) {
      const databases = await window.indexedDB.databases();
      await Promise.all(
        databases
          .map((database) => database.name)
          .filter((name): name is string => Boolean(name))
          .map(
            (name) =>
              new Promise<void>((resolve) => {
                const request = window.indexedDB.deleteDatabase(name);
                request.onsuccess =
                  request.onerror =
                  request.onblocked =
                    () => resolve();
              }),
          ),
      );
    }
  } catch {
    // IndexedDB is optional and should not prevent redirecting.
  }
}

// Client for general rental API endpoints.
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const baseUrl = requireApiUrl(API_URL, "NEXT_PUBLIC_API_URL");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection.",
    );
  }

  const result = await readJson<ApiResponse<T> & { message?: string }>(
    response,
  );

  if (!response.ok || !result?.success) {
    if (response.status === 401 && typeof window !== "undefined") {
      await clearClientData();
      window.location.replace("/login");
    }
    throw new Error(
      result?.message ||
        "An error occurred while communicating with the server.",
    );
  }

  return result;
}

// Dedicated client for the central authentication service.
export async function loginUser(
  credentials: Partial<LoginPayload>,
): Promise<LoginResponseData> {
  const baseUrl = requireApiUrl(AUTH_URL, "NEXT_PUBLIC_AUTH_URL");
  const payload: LoginPayload = {
    email: credentials.email || "",
    password: credentials.password || "",
    productCode: "RENTAL",
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the authentication server.");
  }

  const result = await readJson<ApiResponse<LoginResponseData>>(response);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || "Login failed. Please check your credentials.",
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

export async function logoutUser(redirectToLogin = true) {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("accessToken");

  if (token) {
    const baseUrl = requireApiUrl(AUTH_URL, "NEXT_PUBLIC_AUTH_URL");
    void fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }).catch((error) => {
      console.error("Logout API request failed:", error);
    });
  }

  await clearClientData();

  if (redirectToLogin) window.location.replace("/login");
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}
