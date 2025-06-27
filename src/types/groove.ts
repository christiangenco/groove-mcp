export interface Conversation {
  id: string;
  number: number;
  status: 'unread' | 'opened' | 'closed' | 'snoozed';
  subject: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  snoozedUntil?: string;
  assignee?: Agent;
  contact: Contact;
  tags: Tag[];
  messageCount: number;
  noteCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  author: Contact | Agent;
  body: string;
  bodyPlainText?: string;
  createdAt: string;
  updatedAt: string;
  type: 'message' | 'note';
  attachments: Attachment[];
}

export interface Contact {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, any>;
}

export interface Agent {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: 'admin' | 'agent';
  available: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  bodyPlainText?: string;
  categoryId: string;
  category?: KnowledgeBaseCategory;
  published: boolean;
  featured: boolean;
  views: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  author?: Agent;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  parent?: KnowledgeBaseCategory;
  position: number;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLError {
  message: string;
  extensions?: {
    code: string;
    [key: string]: any;
  };
}