import type { LoginResponseDto } from "../api/auth.dto";
import type { AuthSession } from "../../../infrastructure/auth/auth.types";
import {
  createInvalidResponseError,
  decodeJwtSegment,
  isObject,
  safeTrim,
  toFiniteNumber,
  toTrimmedString,
} from "../../../shared/utils/mapper.utils";
import { unwrapEnvelope } from "../../../shared/utils/api-response.utils";

interface RawLoginCandidate {
  token?: unknown;
  expiresAt?: unknown;
  expiresIn?: unknown;
}

export function extractLoginData(response: unknown): unknown {
  return unwrapEnvelope(response);
}

function parseLoginResponseDto(data: unknown): LoginResponseDto {
  if (typeof data === "string") {
    const token = safeTrim(data);
    if (!token) {
      throw createInvalidResponseError(
        "INVALID_AUTH_TOKEN",
        "Login response did not include a valid auth token.",
      );
    }

    return {
      token,
      expiresAt: null,
      expiresIn: null,
    };
  }

  if (!isObject(data)) {
    throw createInvalidResponseError(
      "INVALID_LOGIN_RESPONSE",
      "Login response payload is not a valid object.",
    );
  }

  const candidate = data as RawLoginCandidate;
  const token = toTrimmedString(candidate.token);

  if (!token) {
    throw createInvalidResponseError(
      "INVALID_AUTH_TOKEN",
      "Login response did not include a valid auth token.",
    );
  }

  return {
    token,
    expiresAt: toTrimmedString(candidate.expiresAt),
    expiresIn: toFiniteNumber(candidate.expiresIn),
  };
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = decodeJwtSegment(parts[1]);
    return JSON.parse(payload) as { exp?: number };
  } catch {
    return null;
  }
}

function readExpiresAt(dto: LoginResponseDto): Date {
  if (dto.expiresAt) {
    const parsedDate = new Date(dto.expiresAt);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  if (typeof dto.expiresIn === "number") {
    return new Date(Date.now() + dto.expiresIn * 1000);
  }

  const jwtPayload = decodeJwtPayload(dto.token);
  if (typeof jwtPayload?.exp === "number" && Number.isFinite(jwtPayload.exp)) {
    return new Date(jwtPayload.exp * 1000);
  }

  return new Date(Date.now() + 5 * 60 * 1000);
}

export function readLoginToken(data: unknown): string {
  return parseLoginResponseDto(data).token;
}

export function parseAuthSession(data: unknown): AuthSession {
  const dto = parseLoginResponseDto(data);

  return {
    token: dto.token,
    expiresAt: readExpiresAt(dto),
  };
}
