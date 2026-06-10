/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { CheckCircle2, CircleAlert, TriangleAlert, X } from "lucide-react";

type ToastTone = "success" | "error" | "warning";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ShowToastOptions = {
  id?: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastToneStyles(tone: ToastTone): string {
  if (tone === "success") {
    return "border-emerald-200 bg-white text-emerald-700 shadow-[0_18px_50px_rgba(16,185,129,0.16)]";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-white text-amber-700 shadow-[0_18px_50px_rgba(245,158,11,0.16)]";
  }

  return "border-rose-200 bg-white text-rose-700 shadow-[0_18px_50px_rgba(244,63,94,0.16)]";
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMapRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ id, message, tone = "success", durationMs = 2500 }: ShowToastOptions) => {
      const normalizedMessage = message.trim();
      if (!normalizedMessage) {
        return;
      }

      const nextId = id ?? `${tone}:${normalizedMessage}`;

      setToasts((currentToasts) => {
        if (
          currentToasts.some(
            (toast) =>
              toast.id === nextId ||
              (toast.message === normalizedMessage && toast.tone === tone),
          )
        ) {
          return currentToasts;
        }

        return [
          ...currentToasts,
          {
            id: nextId,
            message: normalizedMessage,
            tone,
          },
        ];
      });

      const existingTimeout = timeoutMapRef.current.get(nextId);
      if (existingTimeout) {
        window.clearTimeout(existingTimeout);
      }

      const timeoutId = window.setTimeout(() => {
        dismissToast(nextId);
      }, durationMs);

      timeoutMapRef.current.set(nextId, timeoutId);
    },
    [dismissToast],
  );

  useEffect(() => {
    const timeoutMap = timeoutMapRef.current;

    return () => {
      timeoutMap.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutMap.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-5 z-[120] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => {
            const Icon =
              toast.tone === "success"
                ? CheckCircle2
                : toast.tone === "warning"
                  ? TriangleAlert
                  : CircleAlert;

            return (
              <div
                key={toast.id}
                role="status"
                aria-live="polite"
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 ${getToastToneStyles(
                  toast.tone,
                )}`}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
