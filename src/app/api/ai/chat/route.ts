import { auth } from '@clerk/nextjs/server';
import { ConversationMessageRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import type { ChatContext, ChatMessage } from '@/server/ai/agents';
import { processChat } from '@/server/ai/agents';
import { projectService } from '@/server/services/project.service';
import { userService } from '@/server/services/user.service';

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Internal server error';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError('Unauthorized', 401);
    }

    let body: { projectId?: string; message?: string };
    try {
      body = (await req.json()) as { projectId?: string; message?: string };
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const { projectId, message } = body;

    if (!projectId || !message?.trim()) {
      return jsonError('Missing projectId or message', 400);
    }

    const ctx = await userService.requireCurrentWorkspace();

    const project = await projectService.getById(projectId, ctx.workspace.id);
    if (!project) {
      return jsonError('Project not found', 404);
    }

    const conversation = project.conversations[0];
    if (!conversation) {
      return jsonError('No conversation found', 404);
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

    let response;
    try {
      response = await processChat(message, chatContext);
    } catch (aiError) {
      console.error('[AI Chat] processChat failed', aiError);
      await projectService.addMessage(
        conversation.id,
        ConversationMessageRole.ASSISTANT,
        `Le service IA a rencontré un problème : ${serializeError(aiError)}`,
        { error: true },
      );
      return jsonError(serializeError(aiError), 502);
    }

    try {
      await projectService.addMessage(
        conversation.id,
        ConversationMessageRole.ASSISTANT,
        response.message,
        response.metadata,
      );
    } catch (persistError) {
      console.error('[AI Chat] Failed to persist assistant message', persistError);
      return jsonError('Failed to save assistant message', 500);
    }

    return NextResponse.json({
      message: response.message,
      brief: response.brief,
      strategy: response.strategy,
      shouldGenerate: response.shouldGenerate,
    });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    return jsonError(serializeError(error), 500);
  }
}
