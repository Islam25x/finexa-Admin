import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../shared/ui/ToastProvider";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { getUserApi, getUsersApi, userActionApi } from "../api/users.api";
import type { UserAction, UsersListParams } from "../types/users.types";

export function useUsers(params: UsersListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsersApi(params),
  });
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => getUserApi(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useUserAction() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: UserAction; reason?: string }) =>
      userActionApi(id, action, reason),
    onSuccess: async (_data, variables) => {
      showToast({
        message: `Action "${variables.action}" completed successfully.`,
        tone: "success",
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
    onError: (error: Error) => {
      showToast({
        message: error.message || "Failed to perform action. Please try again.",
        tone: "error",
      });
    },
  });
}
