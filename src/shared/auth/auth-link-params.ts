function decodeQueryValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function readAuthLinkParam(source: string, key: string): string {
  const normalizedSource =
    source.startsWith("?") || source.startsWith("#") ? source.slice(1) : source;

  if (!normalizedSource) {
    return "";
  }

  const normalizedKey = key.toLowerCase();

  for (const pair of normalizedSource.split("&")) {
    if (!pair) {
      continue;
    }

    const separatorIndex = pair.indexOf("=");
    const rawKey = separatorIndex >= 0 ? pair.slice(0, separatorIndex) : pair;
    const decodedKey = decodeQueryValue(rawKey).trim().toLowerCase();

    if (decodedKey !== normalizedKey) {
      continue;
    }

    const rawValue = separatorIndex >= 0 ? pair.slice(separatorIndex + 1) : "";
    return decodeQueryValue(rawValue).trim();
  }

  return "";
}
