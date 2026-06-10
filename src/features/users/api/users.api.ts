import { requestJson } from "../../../infrastructure/api/http";
import { unwrapEnvelope } from "../../../shared/utils/api-response.utils";
import type { AdminUser, UserAction, UsersListParams, UsersListResult, UserStatus } from "../types/users.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(source: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function readBoolean(source: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
  }
  return null;
}

function readItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  for (const key of ["items", "users", "data", "results"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function mapStatus(row: Record<string, unknown>): UserStatus {
  const status = readString(row, ["status", "accountStatus"]).toLowerCase();
  if (status.includes("lock")) return "locked";
  if (status.includes("inactive") || status.includes("deactivated")) return "inactive";
  if (readBoolean(row, ["isLocked", "locked"]) === true) return "locked";
  if (readBoolean(row, ["isActive", "active"]) === false) return "inactive";
  return "active";
}

function mapUser(row: unknown): AdminUser {
  const source = isRecord(row) ? row : {};
  const firstName = readString(source, ["firstName"]);
  const lastName = readString(source, ["lastName"]);
  const name = readString(source, ["name", "fullName", "userName"], `${firstName} ${lastName}`.trim());
  const isAdmin = readBoolean(source, ["isAdmin", "admin"]);

  return {
    id: readString(source, ["id", "userId"], ""),
    name: name || "Unnamed user",
    email: readString(source, ["email", "emailAddress"], "unknown@finexa.com"),
    role: readString(source, ["role", "roles"], isAdmin ? "Admin" : "User"),
    status: mapStatus(source),
    createdAt: readString(source, ["createdAt", "createdOn"], "-"),
    lastLoginAt: readString(source, ["lastLoginAt", "lastSeenAt"], "-"),
  };
}

function buildUsersPath(params: UsersListParams): string {
  const search = new URLSearchParams();
  if (params.search.trim()) search.set("search", params.search.trim());
  if (params.createdFrom) search.set("createdFrom", params.createdFrom);
  if (params.createdTo) search.set("createdTo", params.createdTo);
search.set("PageNumber", String(params.page));
search.set("PageSize", String(params.pageSize));

  return `/api/admin/users?${search.toString()}`;
}

export async function getUsersApi(params: UsersListParams): Promise<UsersListResult> {
  const response = await requestJson<unknown>(buildUsersPath(params), {
    method: "GET",
    withAuth: true,
  });
  const payload = unwrapEnvelope(response);
  const source = isRecord(payload) ? payload : {};
  const users = readItems(payload).map(mapUser).filter((user) => user.id);

  return {
     users,
    page: readNumber(source, ["pageNumber"], 1),
    pageSize: readNumber(source, ["pageSize"], 10),
    total: readNumber(source, ["totalCount"], users.length),
  };
}

export async function getUserApi(id: string): Promise<AdminUser> {
  const response = await requestJson<unknown>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "GET",
    withAuth: true,
  });

  return mapUser(unwrapEnvelope(response));
}

export async function userActionApi(id: string, action: UserAction, reason: string = ""): Promise<void> {
  await requestJson<unknown>(`/api/admin/users/${encodeURIComponent(id)}/${action}`, {
    method: "POST",
    withAuth: true,
    body: JSON.stringify({ reason: reason.trim() }),
  });
}
