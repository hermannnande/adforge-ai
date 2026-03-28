import type {
  ConversationMessageRole,
  PlatformTarget,
  Prisma,
  QualityMode,
} from '@prisma/client';

import { prisma } from '@/lib/db/prisma';

const projectDetailInclude = {
  conversations: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      messages: { orderBy: { createdAt: 'asc' as const } },
    },
  },
  brandKit: true,
  settings: true,
} satisfies Prisma.ProjectInclude;

export const projectService = {
  async create(data: {
    workspaceId: string;
    name: string;
    platform?: PlatformTarget;
    qualityMode?: QualityMode;
    brandKitId?: string;
    objective?: string;
  }) {
    return prisma.project.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        brandKitId: data.brandKitId,
        settings: {
          create: {
            platform: data.platform ?? 'FACEBOOK_ADS',
            qualityMode: data.qualityMode ?? 'STANDARD',
            objective: data.objective,
          },
        },
        conversations: {
          create: [{ title: 'Principal' }],
        },
      },
      include: projectDetailInclude,
    });
  },

  async listByWorkspace(workspaceId: string) {
    return prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        status: { not: 'DELETED' },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        settings: true,
        brandKit: true,
      },
    });
  },

  async getById(projectId: string, workspaceId: string) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
        deletedAt: null,
      },
      include: projectDetailInclude,
    });
  },

  async softDelete(projectId: string, workspaceId: string) {
    await prisma.project.updateMany({
      where: {
        id: projectId,
        workspaceId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
    });
  },

  async addMessage(
    conversationId: string,
    role: ConversationMessageRole,
    content: string,
    metadata?: Record<string, unknown>,
  ) {
    return prisma.conversationMessage.create({
      data: {
        conversationId,
        role,
        content,
        metadata: metadata === undefined ? undefined : (metadata as Prisma.InputJsonValue),
      },
    });
  },

  async getConversation(conversationId: string, workspaceId: string) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        project: { workspaceId },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  },
};
