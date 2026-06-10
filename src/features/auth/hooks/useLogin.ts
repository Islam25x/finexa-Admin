import { useEffect, useRef } from "react";
import {
  useMutation,
  type UseMutationResult,
} from "@tanstack/react-query";
import { loginApi } from "../api/auth.api";
import type { LoginRequestDto } from "../api/auth.dto";
import type { AuthSession } from "../../../infrastructure/auth/auth.types";
import { extractLoginData, parseAuthSession } from "../utils/auth.parser";
import { ApiError } from "../../../infrastructure/api/api-error";

type LoginMutation = UseMutationResult<AuthSession, ApiError, LoginRequestDto>;

type UseLoginResult = LoginMutation & {
  cancel: () => void;
};

export function useLogin(): UseLoginResult {
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<AuthSession, ApiError, LoginRequestDto>({
    mutationKey: ["auth", "login"],
    mutationFn: async (payload) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const loginResponse = await loginApi(
          {
            email: payload.email.trim(),
            password: payload.password,
          },
          { signal: controller.signal },
        );

        return parseAuthSession(extractLoginData(loginResponse));
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    retry: 0,
  });

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...mutation,
    cancel: () => abortControllerRef.current?.abort(),
  };
}
