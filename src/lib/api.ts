export async function authFetch(
  url: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
) {
  const token = await getToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}
