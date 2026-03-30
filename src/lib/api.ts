export async function authFetch(
  url: string,
  auth: {
    getToken: () => Promise<string | null>;
    userId?: string | null;
    sessionId?: string | null;
  },
  init?: RequestInit,
) {
  const token = await auth.getToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (auth.userId) {
    headers.set('x-clerk-user-id', auth.userId);
  }
  if (auth.sessionId) {
    headers.set('x-clerk-session-id', auth.sessionId);
  }

  const isLongRunning =
    url.includes('/generate') || url.includes('/ai/chat');

  if (isLongRunning && !init?.signal) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150_000);
    try {
      return await fetch(url, { ...init, headers, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return fetch(url, { ...init, headers });
}
