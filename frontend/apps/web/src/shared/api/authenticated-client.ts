import { apiRequest, ApiError } from "./client";
import { authService } from "../../features/auth/services/auth.service";
import { useAuthStore } from "../stores/auth.store";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = authService.refresh()
      .then((flow) => {
        useAuthStore.getState().setAuth(flow);
        return flow.accessToken;
      })
      .catch(() => {
        useAuthStore.setState({ accessToken: null, user: null, challenge: null });
        return null;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const execute = (token: string | null) => apiRequest<T>(path, {
    ...init,
    headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  try {
    return await execute(useAuthStore.getState().accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const token = await refreshAccessToken();
    if (!token) throw error;
    return execute(token);
  }
}
