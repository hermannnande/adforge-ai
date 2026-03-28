import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/db/prisma';

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = event;

  switch (type) {
    case 'user.created': {
      const email =
        data.email_addresses.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ?? data.email_addresses[0]?.email_address;

      if (!email) {
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      const slug = generateSlug(data.first_name, data.last_name, data.id);

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkId: data.id,
            email,
            firstName: data.first_name,
            lastName: data.last_name,
            avatarUrl: data.image_url,
          },
        });

        const workspace = await tx.workspace.create({
          data: {
            name: data.first_name ? `${data.first_name}'s workspace` : 'Mon espace',
            slug,
            members: {
              create: {
                userId: user.id,
                role: 'OWNER',
              },
            },
          },
        });

        await tx.creditWallet.create({
          data: {
            workspaceId: workspace.id,
            balance: 20,
            grants: {
              create: {
                type: 'TRIAL',
                amount: 20,
                remaining: 20,
                expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                description: 'Crédits d\'essai offerts à l\'inscription',
              },
            },
            ledger: {
              create: {
                type: 'GRANT',
                amount: 20,
                balanceAfter: 20,
                category: 'TRIAL',
                description: 'Crédits d\'essai — bienvenue sur AdForge AI',
                idempotencyKey: `trial-${user.id}`,
              },
            },
          },
        });

        await tx.userPreference.create({
          data: { userId: user.id },
        });
      });

      break;
    }

    case 'user.updated': {
      const email =
        data.email_addresses.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ?? data.email_addresses[0]?.email_address;

      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          email: email ?? undefined,
          firstName: data.first_name,
          lastName: data.last_name,
          avatarUrl: data.image_url,
        },
      });
      break;
    }

    case 'user.deleted': {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: { role: 'USER' },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function generateSlug(firstName: string | null, lastName: string | null, id: string): string {
  const base = [firstName, lastName]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30);

  const suffix = id.slice(-6);
  return base ? `${base}-${suffix}` : `workspace-${suffix}`;
}
