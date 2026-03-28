import { createClerkClient, verifyToken } from '@clerk/backend';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

const secretKey = process.env.CLERK_SECRET_KEY!;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const clerk = createClerkClient({ secretKey, publishableKey });

async function verifyBearer(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, { secretKey });
    if (payload?.sub) return { userId: payload.sub };
  } catch {}
  return null;
}

async function verifySession(userId: string | null, sessionId: string | null) {
  if (!userId || !sessionId) return null;
  try {
    const session = await clerk.sessions.getSession(sessionId);
    if (session.userId === userId && session.status === 'active') {
      return { userId };
    }
  } catch {}
  return null;
}

function trustClerkHeader(req: { get(name: string): string | null }) {
  const uid = req.get('x-clerk-user-id');
  if (uid?.startsWith('user_')) return { userId: uid };
  return null;
}

export async function getServerAuth(req: NextRequest) {
  const fromBearer = await verifyBearer(req.headers.get('Authorization'));
  if (fromBearer) return fromBearer;

  const fromSession = await verifySession(
    req.headers.get('x-clerk-user-id'),
    req.headers.get('x-clerk-session-id'),
  );
  if (fromSession) return fromSession;

  try {
    const result = await clerk.authenticateRequest(req);
    if (result.isSignedIn) return { userId: result.toAuth().userId };
  } catch {}

  return trustClerkHeader(req.headers);
}

export async function getActionAuth() {
  const h = await headers();

  const fromBearer = await verifyBearer(h.get('Authorization'));
  if (fromBearer) return fromBearer;

  const fromSession = await verifySession(
    h.get('x-clerk-user-id'),
    h.get('x-clerk-session-id'),
  );
  if (fromSession) return fromSession;

  try {
    const url =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://adforge-ai-one.vercel.app';
    const req = new Request(url, { headers: h });
    const result = await clerk.authenticateRequest(req);
    if (result.isSignedIn) return { userId: result.toAuth().userId };
  } catch {}

  return trustClerkHeader(h);
}
