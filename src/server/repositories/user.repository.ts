import { prisma } from '@/lib/db/prisma';

export const userRepository = {
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
      include: {
        preferences: true,
        workspaceMembers: {
          include: {
            workspace: {
              include: { creditWallet: true },
            },
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { preferences: true },
    });
  },

  async updateOnboardingDone(clerkId: string) {
    return prisma.user.update({
      where: { clerkId },
      data: { onboardingDone: true },
    });
  },

  async updateLastLogin(clerkId: string) {
    return prisma.user.update({
      where: { clerkId },
      data: { lastLoginAt: new Date() },
    });
  },
};
