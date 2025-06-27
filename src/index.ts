#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GrooveClient } from './groove-client.js';
import { ConversationTools } from './tools/conversations.js';
import { MessageTools } from './tools/messages.js';
import { ContactTools } from './tools/contacts.js';
import { AgentTools } from './tools/agents.js';
import { KnowledgeBaseResources } from './resources/kb-articles.js';

const apiToken = process.env.GROOVE_API_TOKEN;
const apiUrl = process.env.GROOVE_API_URL || 'https://api.groovehq.com/v2/graphql';

if (!apiToken) {
  console.error('Error: GROOVE_API_TOKEN environment variable is required');
  process.exit(1);
}

const grooveClient = new GrooveClient(apiToken, apiUrl);
const conversationTools = new ConversationTools(grooveClient);
const messageTools = new MessageTools(grooveClient);
const contactTools = new ContactTools(grooveClient);
const agentTools = new AgentTools(grooveClient);
const kbResources = new KnowledgeBaseResources(grooveClient);

const server = new Server(
  {
    name: 'groove-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'listConversations',
        description: 'List conversations with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['unread', 'opened', 'closed', 'snoozed'],
              description: 'Filter by conversation status',
            },
            assigneeId: {
              type: 'string',
              description: 'Filter by assigned agent ID',
            },
            contactId: {
              type: 'string',
              description: 'Filter by contact ID',
            },
            tagIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tag IDs',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of conversations to return',
              default: 20,
            },
          },
        },
      },
      {
        name: 'getConversation',
        description: 'Get detailed information about a specific conversation',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The conversation ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'createConversation',
        description: 'Create a new conversation',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'ID of the contact to start conversation with',
            },
            subject: {
              type: 'string',
              description: 'Subject of the conversation',
            },
            body: {
              type: 'string',
              description: 'Initial message body',
            },
            assigneeId: {
              type: 'string',
              description: 'ID of agent to assign the conversation to',
            },
            tagIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tag IDs to apply to the conversation',
            },
          },
          required: ['contactId', 'subject', 'body'],
        },
      },
      {
        name: 'updateConversation',
        description: 'Update a conversation (status, assignee, tags)',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The conversation ID',
            },
            status: {
              type: 'string',
              enum: ['opened', 'closed', 'snoozed'],
              description: 'New conversation status',
            },
            assigneeId: {
              type: 'string',
              description: 'ID of agent to assign the conversation to (or null to unassign)',
            },
            tagIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tag IDs to apply to the conversation',
            },
            snoozedUntil: {
              type: 'string',
              description: 'ISO 8601 datetime to snooze until',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'closeConversation',
        description: 'Close a conversation',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The conversation ID to close',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'listMessages',
        description: 'List messages in a conversation',
        inputSchema: {
          type: 'object',
          properties: {
            conversationId: {
              type: 'string',
              description: 'The conversation ID to list messages for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of messages to return',
              default: 50,
            },
            after: {
              type: 'string',
              description: 'Cursor for pagination',
            },
          },
          required: ['conversationId'],
        },
      },
      {
        name: 'sendMessage',
        description: 'Send a message in a conversation',
        inputSchema: {
          type: 'object',
          properties: {
            conversationId: {
              type: 'string',
              description: 'The conversation ID to send message to',
            },
            body: {
              type: 'string',
              description: 'The message body content',
            },
            attachmentIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'IDs of attachments to include',
            },
          },
          required: ['conversationId', 'body'],
        },
      },
      {
        name: 'createNote',
        description: 'Create an internal note in a conversation',
        inputSchema: {
          type: 'object',
          properties: {
            conversationId: {
              type: 'string',
              description: 'The conversation ID to add note to',
            },
            body: {
              type: 'string',
              description: 'The note content',
            },
          },
          required: ['conversationId', 'body'],
        },
      },
      {
        name: 'listContacts',
        description: 'List contacts with optional search',
        inputSchema: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Search string to filter contacts',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of contacts to return',
              default: 20,
            },
            after: {
              type: 'string',
              description: 'Cursor for pagination',
            },
          },
        },
      },
      {
        name: 'getContact',
        description: 'Get detailed information about a specific contact',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The contact ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'createContact',
        description: 'Create a new contact',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Contact email address',
            },
            firstName: {
              type: 'string',
              description: 'Contact first name',
            },
            lastName: {
              type: 'string',
              description: 'Contact last name',
            },
            company: {
              type: 'string',
              description: 'Contact company',
            },
            title: {
              type: 'string',
              description: 'Contact job title',
            },
            phone: {
              type: 'string',
              description: 'Contact phone number',
            },
          },
          required: ['email'],
        },
      },
      {
        name: 'updateContact',
        description: 'Update contact information',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The contact ID',
            },
            email: {
              type: 'string',
              description: 'Contact email address',
            },
            firstName: {
              type: 'string',
              description: 'Contact first name',
            },
            lastName: {
              type: 'string',
              description: 'Contact last name',
            },
            company: {
              type: 'string',
              description: 'Contact company',
            },
            title: {
              type: 'string',
              description: 'Contact job title',
            },
            phone: {
              type: 'string',
              description: 'Contact phone number',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'listAgents',
        description: 'List all agents in the organization',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'getAgent',
        description: 'Get detailed information about a specific agent',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The agent ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'getAvailableAgents',
        description: 'List all available agents',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'searchKbArticles',
        description: 'Search knowledge base articles',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of articles to return',
              default: 20,
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'listConversations': {
        const conversations = await conversationTools.listConversations(args || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(conversations, null, 2),
            },
          ],
        };
      }

      case 'getConversation': {
        if (!args || typeof args.id !== 'string') {
          throw new Error('Conversation ID is required');
        }
        const conversation = await conversationTools.getConversation(args.id);
        if (!conversation) {
          throw new Error(`Conversation not found: ${args.id}`);
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(conversation, null, 2),
            },
          ],
        };
      }

      case 'createConversation': {
        if (!args || !args.contactId || !args.subject || !args.body) {
          throw new Error('contactId, subject, and body are required');
        }
        const conversation = await conversationTools.createConversation(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(conversation, null, 2),
            },
          ],
        };
      }

      case 'updateConversation': {
        if (!args || typeof args.id !== 'string') {
          throw new Error('Conversation ID is required');
        }
        const conversation = await conversationTools.updateConversation(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(conversation, null, 2),
            },
          ],
        };
      }

      case 'closeConversation': {
        if (!args || typeof args.id !== 'string') {
          throw new Error('Conversation ID is required');
        }
        const conversation = await conversationTools.closeConversation(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(conversation, null, 2),
            },
          ],
        };
      }

      case 'listMessages': {
        if (!args || typeof args.conversationId !== 'string') {
          throw new Error('Conversation ID is required');
        }
        const messages = await messageTools.listMessages(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      }

      case 'sendMessage': {
        if (!args || !args.conversationId || !args.body) {
          throw new Error('conversationId and body are required');
        }
        const message = await messageTools.sendMessage(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(message, null, 2),
            },
          ],
        };
      }

      case 'createNote': {
        if (!args || !args.conversationId || !args.body) {
          throw new Error('conversationId and body are required');
        }
        const note = await messageTools.createNote(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(note, null, 2),
            },
          ],
        };
      }

      case 'listContacts': {
        const contacts = await contactTools.listContacts(args || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contacts, null, 2),
            },
          ],
        };
      }

      case 'getContact': {
        if (!args || typeof args.id !== 'string') {
          throw new Error('Contact ID is required');
        }
        const contact = await contactTools.getContact(args.id);
        if (!contact) {
          throw new Error(`Contact not found: ${args.id}`);
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contact, null, 2),
            },
          ],
        };
      }

      case 'createContact': {
        if (!args || !args.email) {
          throw new Error('email is required');
        }
        const contact = await contactTools.createContact(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contact, null, 2),
            },
          ],
        };
      }

      case 'updateContact': {
        if (!args || typeof args.id !== 'string') {
          throw new Error('Contact ID is required');
        }
        const contact = await contactTools.updateContact(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contact, null, 2),
            },
          ],
        };
      }

      case 'listAgents': {
        const agents = await agentTools.listAgents();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(agents, null, 2),
            },
          ],
        };
      }

      case 'getAgent': {
        if (!args || typeof args.id !== 'string') {
          throw new Error('Agent ID is required');
        }
        const agent = await agentTools.getAgent(args.id);
        if (!agent) {
          throw new Error(`Agent not found: ${args.id}`);
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(agent, null, 2),
            },
          ],
        };
      }

      case 'getAvailableAgents': {
        const agents = await agentTools.getAvailableAgents();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(agents, null, 2),
            },
          ],
        };
      }

      case 'searchKbArticles': {
        if (!args || !args.query) {
          throw new Error('Search query is required');
        }
        const articles = await kbResources.searchArticles(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(articles, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    // Get published KB articles
    const articles = await kbResources.listArticles({ published: true, limit: 50 });
    const resources = articles.map(article => kbResources.formatArticleResource(article));
    
    return {
      resources,
    };
  } catch (error) {
    console.error('Error listing KB resources:', error);
    return {
      resources: [],
    };
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  // Parse the URI to extract the type and ID
  const match = uri.match(/^groove:\/\/kb\/(article|category)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  
  const [, type, id] = match;
  
  if (type === 'article') {
    const article = await kbResources.getArticle(id);
    if (!article) {
      throw new Error(`Knowledge base article not found: ${id}`);
    }
    
    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: `# ${article.title}\n\n${article.body}`,
          metadata: {
            category: article.category?.name,
            views: article.views,
            helpful: article.helpfulVotes,
            unhelpful: article.unhelpfulVotes,
            published: article.published,
            featured: article.featured,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          },
        },
      ],
    };
  }
  
  throw new Error(`Unsupported resource type: ${type}`);
});

async function main() {
  console.error('Validating Groove API connection...');
  const isValid = await grooveClient.validateConnection();
  
  if (!isValid) {
    console.error('Failed to connect to Groove API. Please check your API token.');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Groove MCP server started successfully');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});