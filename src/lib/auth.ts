import { createClerkClient } from '@clerk/backend';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
});

export async function getServerAuth(req: NextRequest) {
  try {
    const result = await clerk.authenticateRequest(req);

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
    const url =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://adforge-ai-one.vercel.app';
    const req = new Request(url, { headers: headersList });

    const result = await clerk.authenticateRequest(req);

    if (!result.isSignedIn) return null;
    return { userId: result.toAuth().userId };
  } catch (error) {
    console.error('[getActionAuth] Failed:', error);
    return null;
  }
}
