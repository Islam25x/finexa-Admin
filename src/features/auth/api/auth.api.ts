import { requestJson } from "../../../infrastructure/api/http";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import type { LoginRequestDto, LogoutResponseDto } from "./auth.dto";

export async function loginApi(
  payload: LoginRequestDto,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}

export async function logoutApi(
  options?: { signal?: AbortSignal },
): Promise<LogoutResponseDto> {
  return requestJson<LogoutResponseDto>(
    "/api/Auth/logout",
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
      skipAuthRefresh: true,
    }
  );
}
