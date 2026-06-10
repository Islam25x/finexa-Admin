const DEFAULT_APP_API_BASE_URL = "https://finexa.runasp.net";

export const APP_API_BASE_URL =
  import.meta.env.VITE_FINEXA_API_BASE_URL?.trim() || DEFAULT_APP_API_BASE_URL;


export function getAppApiBaseUrl(): string {
  return APP_API_BASE_URL;
}
