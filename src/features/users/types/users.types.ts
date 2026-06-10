export type UserStatus = "active" | "inactive" | "locked";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string;
};

export type UsersListParams = {
  search: string;
  createdFrom: string;
  createdTo: string;
  page: number;
  pageSize: number;
};

export type UsersListResult = {
  users: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
};

export type UserAction =
  | "lock"
  | "unlock"
  | "activate"
  | "deactivate"
  | "make-admin"
  | "remove-admin";
