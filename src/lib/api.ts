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
  return fetch(url, { ...init, headers });
}
