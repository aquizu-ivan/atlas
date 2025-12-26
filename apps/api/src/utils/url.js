export function normalizeBaseUrl(value) {
  if (!value) {
    return "";
  }
  return String(value).trim().replace(/\/+$/, "");
}

export function joinUrl(base, path) {
  const normalizedBase = normalizeBaseUrl(base);
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (!normalizedBase) {
    return normalizedPath;
  }
  return `${normalizedBase}${normalizedPath}`;
}
