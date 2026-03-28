import { auth, currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@/server/repositories/user.repository';

export const userService = {
  async getCurrentUser() {
    const { userId } = await auth();
    if (!userId) return null;

    const dbUser = await userRepository.findByClerkId(userId);
    return dbUser;
  },

  async getCurrentWorkspace() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const membership = user.workspaceMembers[0];
    if (!membership) return null;

    return {
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
