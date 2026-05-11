// Set a cookie
export function setCookie(
  name: string,
  value: string,
  days: number = 365,
): void {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Get a cookie
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Example: Track page visits
export function trackPageVisit(): void {
  let visits = parseInt(getCookie("page_visits") || "0", 10);
  setCookie("page_visits", (visits + 1).toString());
}

// Save theme preference
export function saveThemePreference(theme: string): void {
  setCookie("theme", theme);
}
