import { APP_API_BASE_URL } from "./api-config";
import { decodeJwtSegment } from "../../shared/utils/mapper.utils";
import {
  clearAuthSessionState,
  patchAuthSession,
} from "../auth/auth-session-store";
import { ApiError } from "./api-error";
import { unwrapEnvelope } from "../../shared/utils/api-response.utils";

interface RefreshTokenResponse {
  token: string;
  expiresAt?: Date;
}

let refreshPromise: Promise<string | null> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const payloadSegment = token.split(".")[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    const payload = decodeJwtSegment(payloadSegment);
    return JSON.parse(payload) as { exp?: number };
  } catch {
    return null;
  }
}

function readExpiresAt(
  token: string,
  expiresAtValue: unknown,
  expiresInValue: unknown,
): Date | undefined {
  if (typeof expiresAtValue === "string") {
    const parsedDate = new Date(expiresAtValue);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  if (typeof expiresInValue === "number" && Number.isFinite(expiresInValue)) {
    return new Date(Date.now() + expiresInValue * 1000);
  }

  const payload = decodeJwtPayload(token);
  if (typeof payload?.exp === "number" && Number.isFinite(payload.exp)) {
    return new Date(payload.exp * 1000);
  }

  return undefined;
}

async function parseRefreshResponse(response: Response): Promise<RefreshTokenResponse | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiError(
      "Refresh token response was not valid JSON.",
      response.status,
      "INVALID_RESPONSE",
      undefined,
      error,
    );
  }

  const responseData = unwrapEnvelope(payload);

  if (!isRecord(responseData)) {
    return null;
  }

  const token = toTrimmedString(responseData.token);

  if (!token) {
    return null;
  }

  return {
    token,
    expiresAt: readExpiresAt(token, responseData.expiresAt, responseData.expiresIn),
  };
}

async function performRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${APP_API_BASE_URL}/api/Auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      clearAuthSessionState();
      return null;
    }

    const refreshResponse = await parseRefreshResponse(response);

    if (!refreshResponse) {
      clearAuthSessionState();
      return null;
    }

    patchAuthSession((currentSession) => {
      if (!currentSession) {
        return null;
      }

      return {
        ...currentSession,
        token: refreshResponse.token,
        expiresAt: refreshResponse.expiresAt ?? currentSession.expiresAt,
      };
    });
    return refreshResponse.token;
  } catch {
    clearAuthSessionState();
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    // All pending 401 retries await the same refresh to avoid token rotation races.
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
