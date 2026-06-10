import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth.api";
import { useAuth } from "../../../shared/auth/AuthContext";

export function useLogout() {
  const { logout } = useAuth();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      try {
        await logoutApi();
      } finally {
        await logout();
      }
    },
    retry: 0,
  });
}
