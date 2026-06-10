import { getAppApiBaseUrl as getDefaultApiBaseUrl } from "./api-config";
import { getAuthSessionSnapshot } from "../auth/auth-session-store";
import { refreshAccessToken } from "./auth-refresh";
import { ApiError, mapApiError, readErrorMessage } from "./api-error";

export const API_UNAUTHORIZED_EVENT = "app:api-unauthorized";

interface RequestJsonOptions extends RequestInit {
  baseUrl?: string;
  withAuth?: boolean;
  authTokenOverride?: string;
  skipAuthRefresh?: boolean;
}

function dispatchUnauthorizedEvent(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(API_UNAUTHORIZED_EVENT));
}

export async function requestJson<T>(
  path: string,
  init: RequestJsonOptions,
): Promise<T> {
  try {
    const baseUrl = init.baseUrl ?? getDefaultApiBaseUrl();
    const response = await executeRequest(path, init, baseUrl);

    if (response.status === 401 && init.withAuth && !init.skipAuthRefresh) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        const retryResponse = await executeRequest(path, {
          ...init,
          authTokenOverride: newToken,
          skipAuthRefresh: true,
        }, baseUrl);

        if (retryResponse.ok) {
          return await parseResponseBody<T>(retryResponse);
        }

        if (retryResponse.status === 401) {
          dispatchUnauthorizedEvent();
        }

        const retryMessage = await readErrorMessage(retryResponse);
        throw new ApiError(retryMessage, retryResponse.status, "HTTP");
      }

      dispatchUnauthorizedEvent();
    }

    if (!response.ok) {
      const message = await readErrorMessage(response);

      throw new ApiError(message, response.status, "HTTP");
    }

    return await parseResponseBody<T>(response);
  } catch (error) {
    throw mapApiError(error);
  }
}

async function executeRequest(
  path: string,
  init: RequestJsonOptions,
  baseUrl: string,
): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  const isFormData = init.body instanceof FormData;
  const hasBody = init.body != null;
  const token = init.withAuth
    ? init.authTokenOverride ?? getAuthSessionSnapshot()?.token ?? null
    : null;

  if (isFormData) {
    headers.delete("Content-Type");
  } else if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestInit: RequestJsonOptions = {
    ...init,
    headers,
    credentials: "include",
  };

  delete requestInit.baseUrl;
  delete requestInit.withAuth;
  delete requestInit.authTokenOverride;
  delete requestInit.skipAuthRefresh;

  return fetch(`${baseUrl}${path}`, requestInit);
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ApiError(
        "Response body was not valid JSON.",
        response.status,
        "INVALID_RESPONSE",
        undefined,
        error,
      );
    }
  }

  return (await response.text()) as T;
}

export function getApiBaseUrl(): string {
  return getDefaultApiBaseUrl();
}
