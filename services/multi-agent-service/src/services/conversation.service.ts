import { prisma } from "../config/prisma";

export class ConversationService {
  /**
   * Get or create an active conversation for a user
   */
  public async getOrCreateActiveConversation(userId: string): Promise<string> {
    // Find the most recent active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!conversation) {
      // Create a new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: "New Conversation",
        },
      });
    }

    return conversation.id;
  }

  /**
   * Add a message to a conversation
   */
  public async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    route?: string,
  ): Promise<void> {
    await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        route: route ?? null,
      },
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Get conversation history with messages
   */
  public async getConversationHistory(
    conversationId: string,
    limit: number = 50,
  ): Promise<any> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: limit,
        },
      },
    });

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  public async getUserConversations(userId: string): Promise<any[]> {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get the last message for preview
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return conversations;
  }

  /**
   * Update conversation title based on first user message
   */
  public async updateConversationTitle(
    conversationId: string,
    title: string,
  ): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }
}

export const conversationService = new ConversationService();
