import { getAppApiBaseUrl } from "../../infrastructure/api/api-config";
import { safeTrim } from "./mapper.utils";

type NormalizeProfileImageUrlOptions = {
  cacheKey?: string | number | null;
};

function appendCacheKey(url: string, cacheKey?: string | number | null): string {
  if (cacheKey === null || typeof cacheKey === "undefined" || cacheKey === "") {
    return url;
  }

  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set("v", String(cacheKey));
    return nextUrl.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${encodeURIComponent(String(cacheKey))}`;
  }
}

export function normalizeProfileImageUrl(
  value?: string | null,
  options?: NormalizeProfileImageUrlOptions,
): string {
  const normalizedValue = safeTrim(value).replace(/\\/g, "/");

  if (!normalizedValue) {
    return "";
  }

  const cacheKey = options?.cacheKey;

  if (
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://") ||
    normalizedValue.startsWith("blob:") ||
    normalizedValue.startsWith("data:")
  ) {
    return appendCacheKey(normalizedValue, cacheKey);
  }

  if (normalizedValue.startsWith("//")) {
    return appendCacheKey(`https:${normalizedValue}`, cacheKey);
  }

  const baseUrl = getAppApiBaseUrl().replace(/\/+$/, "");
  const path = normalizedValue.startsWith("/") ? normalizedValue : `/${normalizedValue}`;

  try {
    return appendCacheKey(new URL(path, `${baseUrl}/`).toString(), cacheKey);
  } catch {
    return appendCacheKey(normalizedValue, cacheKey);
  }
}

export default normalizeProfileImageUrl;
