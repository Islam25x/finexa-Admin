import type { AdminUser, UserAction } from "../types/users.types";

export type AvailableAction = {
  label: string;
  value: UserAction;
  destructive?: boolean;
};

export function getAvailableActions(user: AdminUser): AvailableAction[] {
  const actions: AvailableAction[] = [];
  const isAdmin = user.role === "Admin";
  const isLocked = user.status === "locked";
  const isActive = user.status === "active";

  // Lock/Unlock
  if (isLocked) {
    actions.push({ label: "Unlock", value: "unlock" });
  } else if (isActive || user.status === "inactive") {
    actions.push({ label: "Lock", value: "lock", destructive: true });
  }

  // Activate/Deactivate
  if (!isActive && !isLocked) {
    actions.push({ label: "Activate", value: "activate" });
  } else if (isActive) {
    actions.push({ label: "Deactivate", value: "deactivate" });
  }

  // Make Admin/Remove Admin - only one based on role
  if (isAdmin) {
    actions.push({ label: "Remove Admin", value: "remove-admin", destructive: true });
  } else {
    actions.push({ label: "Make Admin", value: "make-admin" });
  }

  return actions;
}
