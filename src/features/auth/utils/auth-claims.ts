import type { AuthSession } from "../../../infrastructure/auth/auth.types";
import { decodeJwtSegment } from "../../../shared/utils/mapper.utils";

const ROLE_CLAIM_KEYS = [
  "role",
  "roles",
  "Role",
  "Roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

const ADMIN_ROLES = new Set(["admin", "administrator"]);

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const payloadSegment = token.split(".")[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeJwtSegment(payloadSegment)) as unknown;
    return typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function readRoleValues(payload: Record<string, unknown>): string[] {
  return ROLE_CLAIM_KEYS.flatMap((key) => {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }

    return typeof value === "string" ? [value] : [];
  });
}

export function isAdminSession(session: AuthSession): boolean {
  const payload = parseJwtPayload(session.token);

  if (!payload) {
    return true;
  }

  const roles = readRoleValues(payload);

  if (roles.length === 0) {
    return true;
  }

  return roles.some((role) => ADMIN_ROLES.has(role.trim().toLowerCase()));
}
