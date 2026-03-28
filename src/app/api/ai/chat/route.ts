import { auth } from '@clerk/nextjs/server';
import { ConversationMessageRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import type { ChatContext, ChatMessage } from '@/server/ai/agents';
import { processChat } from '@/server/ai/agents';
import { projectService } from '@/server/services/project.service';
import { userService } from '@/server/services/user.service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { projectId?: string; message?: string };
    const { projectId, message } = body;

    if (!projectId || !message?.trim()) {
      return NextResponse.json({ error: 'Missing projectId or message' }, { status: 400 });
    }

    const ctx = await userService.requireCurrentWorkspace();

    const project = await projectService.getById(projectId, ctx.workspace.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const conversation = project.conversations[0];
    if (!conversation) {
      return NextResponse.json({ error: 'No conversation found' }, { status: 404 });
    }

    await projectService.addMessage(conversation.id, ConversationMessageRole.USER, message);

    const messages: ChatMessage[] = conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as ChatMessage['role'],
      content: m.content,
    }));
    messages.push({ role: 'user', content: message });

    const brandKit = project.brandKit
      ? {
          name: project.brandKit.name,
          tone: project.brandKit.tone,
          primaryColors: project.brandKit.primaryColors,
          secondaryColors: project.brandKit.secondaryColors,
          fonts: project.brandKit.fonts,
          preferredCTAs: project.brandKit.preferredCTAs,
          forbiddenWords: project.brandKit.forbiddenWords,
        }
      : undefined;

    const chatContext: ChatContext = {
      projectId,
      messages,
      brandKit,
    };

    const response = await processChat(message, chatContext);

    await projectService.addMessage(
      conversation.id,
      ConversationMessageRole.ASSISTANT,
      response.message,
      response.metadata,
    );

    return NextResponse.json({
      message: response.message,
      brief: response.brief,
      strategy: response.strategy,
      shouldGenerate: response.shouldGenerate,
    });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
