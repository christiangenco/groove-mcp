import { GrooveClient } from '../groove-client.js';
import { queries, mutations } from '../utils/graphql-queries.js';
import { Conversation } from '../types/groove.js';

interface ListConversationsArgs {
  status?: 'unread' | 'opened' | 'closed' | 'snoozed';
  assigneeId?: string;
  contactId?: string;
  tagIds?: string[];
  limit?: number;
}

interface UpdateConversationArgs {
  id: string;
  status?: 'opened' | 'closed' | 'snoozed';
  assigneeId?: string;
  tagIds?: string[];
  snoozedUntil?: string;
}

interface CreateConversationArgs {
  contactId: string;
  subject: string;
  body: string;
  assigneeId?: string;
  tagIds?: string[];
}

export class ConversationTools {
  constructor(private client: GrooveClient) {}

  async listConversations(args: ListConversationsArgs): Promise<Conversation[]> {
    const variables = {
      first: args.limit || 20,
      status: args.status?.toUpperCase(),
      assigneeId: args.assigneeId,
      contactId: args.contactId,
      tagIds: args.tagIds,
    };

    const response = await this.client.request<{
      conversations: {
        edges: Array<{ node: Conversation }>;
      };
    }>(queries.listConversations, variables);

    return response.conversations.edges.map(edge => edge.node);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const response = await this.client.request<{
      conversation: Conversation | null;
    }>(queries.getConversation, { id });

    return response.conversation;
  }

  async createConversation(args: CreateConversationArgs): Promise<Conversation> {
    const input = {
      contactId: args.contactId,
      subject: args.subject,
      body: args.body,
      assigneeId: args.assigneeId,
      tagIds: args.tagIds,
    };

    const response = await this.client.request<{
      createConversation: {
        conversation: Conversation;
      };
    }>(mutations.createConversation, { input });

    return response.createConversation.conversation;
  }

  async updateConversation(args: UpdateConversationArgs): Promise<Conversation> {
    const input: any = {};
    
    if (args.status) input.status = args.status.toUpperCase();
    if (args.assigneeId !== undefined) input.assigneeId = args.assigneeId;
    if (args.tagIds) input.tagIds = args.tagIds;
    if (args.snoozedUntil) input.snoozedUntil = args.snoozedUntil;

    const response = await this.client.request<{
      updateConversation: {
        conversation: Conversation;
      };
    }>(mutations.updateConversation, { id: args.id, input });

    return response.updateConversation.conversation;
  }

  async closeConversation(id: string): Promise<Conversation> {
    return this.updateConversation({ id, status: 'closed' });
  }
}