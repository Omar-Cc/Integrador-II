import type { ApiResponse, ErrorResponse } from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const text = await response.text();
  let body: ApiResponse<T> | ErrorResponse | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ApiResponse<T> | ErrorResponse;
    } catch {
      throw new ApiError(response.status, "INVALID_RESPONSE", "El servidor devolvio una respuesta invalida.");
    }
  }
  if (!response.ok) {
    const error = body as ErrorResponse | null;
    throw new ApiError(response.status, error?.errorCode ?? "HTTP_ERROR", error?.message ?? "No se pudo completar la solicitud.");
  }
  if (!body || !("data" in body)) {
    return undefined as T;
  }
  return body.data;
}
