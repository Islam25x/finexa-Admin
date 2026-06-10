import { ApiError } from "../../infrastructure/api/api-error";

const BASE64_PADDING_MULTIPLE = 4;

type BufferLike = {
  from(input: string, encoding: "base64"): {
    toString(encoding: "binary"): string;
  };
};

function getBuffer(): BufferLike | undefined {
  return (globalThis as typeof globalThis & { Buffer?: BufferLike }).Buffer;
}

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function safeTrim(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function toTrimmedString(value: unknown): string | null {
  const trimmedValue = typeof value === "string" ? safeTrim(value) : "";
  return trimmedValue ? trimmedValue : null;
}

export function toFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function createInvalidResponseError(
  reason: string,
  message: string,
  details?: unknown,
): ApiError {
  return new ApiError(message, 500, "INVALID_RESPONSE", {
    reason,
    details,
  });
}

export function decodeBase64String(value: string): string {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }

  const buffer = getBuffer();
  if (buffer) {
    return buffer.from(value, "base64").toString("binary");
  }

  throw createInvalidResponseError(
    "BASE64_DECODE_UNAVAILABLE",
    "Unable to decode base64 payload in the current environment.",
  );
}

export function decodeJwtSegment(value: string): string {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue = normalizedValue.padEnd(
    Math.ceil(normalizedValue.length / BASE64_PADDING_MULTIPLE) * BASE64_PADDING_MULTIPLE,
    "=",
  );

  return decodeBase64String(paddedValue);
}
