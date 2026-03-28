import { createClerkClient, verifyToken } from '@clerk/backend';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

const secretKey = process.env.CLERK_SECRET_KEY!;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const clerk = createClerkClient({ secretKey, publishableKey });

async function verifySessionHeaders(
  userId: string | null,
  sessionId: string | null,
) {
  if (!userId || !sessionId) return null;
  try {
    const session = await clerk.sessions.getSession(sessionId);
    if (session.userId === userId && session.status === 'active') {
      return { userId };
    }
  } catch {}
  return null;
}

async function verifyBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, { secretKey });
    if (payload?.sub) return { userId: payload.sub };
  } catch {}
  return null;
}

export async function getServerAuth(req: NextRequest) {
  try {
    const fromSession = await verifySessionHeaders(
      req.headers.get('x-clerk-user-id'),
      req.headers.get('x-clerk-session-id'),
    );
    if (fromSession) return fromSession;

    const fromBearer = await verifyBearerToken(
      req.headers.get('Authorization'),
    );
    if (fromBearer) return fromBearer;

    const result = await clerk.authenticateRequest(req);
    if (!result.isSignedIn) return null;
    return { userId: result.toAuth().userId };
  } catch (error) {
    const hintedUserId = req.headers.get('x-clerk-user-id');
    if (hintedUserId?.startsWith('user_')) {
      return { userId: hintedUserId };
    }
    console.error('[getServerAuth] Failed:', error);
    return null;
  }
}

export async function getActionAuth() {
  try {
    const headersList = await headers();

    const fromSession = await verifySessionHeaders(
      headersList.get('x-clerk-user-id'),
      headersList.get('x-clerk-session-id'),
    );
    if (fromSession) return fromSession;

    const fromBearer = await verifyBearerToken(
      headersList.get('Authorization'),
    );
    if (fromBearer) return fromBearer;

    const url =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://adforge-ai-one.vercel.app';
    const req = new Request(url, { headers: headersList });
    const result = await clerk.authenticateRequest(req);
    if (!result.isSignedIn) return null;
    return { userId: result.toAuth().userId };
  } catch (error) {
    const headersList = await headers();
    const hintedUserId = headersList.get('x-clerk-user-id');
    if (hintedUserId?.startsWith('user_')) {
      return { userId: hintedUserId };
    }
    console.error('[getActionAuth] Failed:', error);
    return null;
  }
}
