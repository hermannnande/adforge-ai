import { createClerkClient } from '@clerk/backend';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
});

const AUTHORIZED_PARTIES = [
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://adforge-ai-one.vercel.app',
  'http://localhost:3000',
];

export async function getServerAuth(req: NextRequest) {
  try {
    const result = await clerk.authenticateRequest(req, {
      authorizedParties: AUTHORIZED_PARTIES,
    });

    if (!result.isSignedIn) return null;
    return { userId: result.toAuth().userId };
  } catch (error) {
    console.error('[getServerAuth] Failed:', error);
    return null;
  }
}

export async function getActionAuth() {
  try {
    const headersList = await headers();
    const req = new Request('https://adforge-ai-one.vercel.app', {
      headers: headersList,
    });

    const result = await clerk.authenticateRequest(req, {
      authorizedParties: AUTHORIZED_PARTIES,
    });

    if (!result.isSignedIn) return null;
    return { userId: result.toAuth().userId };
  } catch (error) {
    console.error('[getActionAuth] Failed:', error);
    return null;
  }
}
