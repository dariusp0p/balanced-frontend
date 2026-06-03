const RAW_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL?.trim();

function normalizedBaseUrl() {
  if (!RAW_BACKEND_BASE_URL || RAW_BACKEND_BASE_URL === "/") {
    return "";
  }

  return RAW_BACKEND_BASE_URL.replace(/\/+$/, "");
}

export function resolveBackendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = normalizedBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export function getBrokerUrl() {
  const baseUrl = normalizedBaseUrl();
  const url = baseUrl
    ? new URL(baseUrl, window.location.origin)
    : new URL(window.location.origin);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}
