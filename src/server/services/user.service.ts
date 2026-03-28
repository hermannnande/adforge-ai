import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { userRepository } from '@/server/repositories/user.repository';

export const userService = {
  async getCurrentUser() {
    const { userId } = await auth();
    if (!userId) return null;

    let dbUser = await userRepository.findByClerkId(userId);

    if (!dbUser) {
      dbUser = await this.provisionFromClerk(userId);
    }

    return dbUser;
  },

  async provisionFromClerk(clerkId: string) {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      const email =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) return null;

      const existing = await prisma.user.findUnique({
        where: { clerkId },
      });
      if (existing) {
        return userRepository.findByClerkId(clerkId);
      }

      const slug = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 30);
      const suffix = clerkId.slice(-6);
      const finalSlug = slug ? `${slug}-${suffix}` : `workspace-${suffix}`;

      const user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatarUrl: clerkUser.imageUrl,
        },
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: clerkUser.firstName
            ? `${clerkUser.firstName}'s workspace`
            : 'Mon espace',
          slug: finalSlug,
          members: {
            create: { userId: user.id, role: 'OWNER' },
          },
        },
      });

      await prisma.creditWallet.create({
        data: {
          workspaceId: workspace.id,
          balance: 20,
          grants: {
            create: {
              type: 'TRIAL',
              amount: 20,
              remaining: 20,
              expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              description: "Crédits d'essai offerts à l'inscription",
            },
          },
          ledger: {
            create: {
              type: 'GRANT',
              amount: 20,
              balanceAfter: 20,
              category: 'TRIAL',
              description: "Crédits d'essai — bienvenue sur AdForge AI",
              idempotencyKey: `trial-${user.id}`,
            },
          },
        },
      });

      await prisma.userPreference.create({
        data: { userId: user.id },
      });

      return userRepository.findByClerkId(clerkId);
    } catch (error) {
      console.error('[userService.provisionFromClerk] Failed:', error);
      return null;
    }
  },

  async getCurrentWorkspace() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const membership = user.workspaceMembers[0];
    if (!membership) return null;

    return {
      user,
      workspace: membership.workspace,
      role: membership.role,
      wallet: membership.workspace.creditWallet,
    };
  },

  async requireCurrentUser() {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  },

  async requireCurrentWorkspace() {
    const ctx = await this.getCurrentWorkspace();
    if (!ctx) {
      throw new Error('No workspace found');
    }
    return ctx;
  },

  async getClerkUser() {
    return currentUser();
  },

  async completeOnboarding(clerkId: string) {
    return userRepository.updateOnboardingDone(clerkId);
  },
};
