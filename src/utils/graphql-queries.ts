export const CONVERSATION_FIELDS = `
  id
  number
  status
  subject
  summary
  createdAt
  updatedAt
  closedAt
  snoozedUntil
  messageCount
  noteCount
  assignee {
    id
    email
    name
    firstName
    lastName
    role
    available
  }
  contact {
    id
    email
    name
    firstName
    lastName
    company
    title
  }
  tags {
    id
    name
    color
  }
`;

export const MESSAGE_FIELDS = `
  id
  body
  bodyPlainText
  createdAt
  updatedAt
  type
  author {
    ... on Contact {
      id
      email
      name
      firstName
      lastName
    }
    ... on Agent {
      id
      email
      name
      firstName
      lastName
      role
    }
  }
  attachments {
    id
    filename
    contentType
    size
    url
  }
`;

export const CONTACT_FIELDS = `
  id
  email
  name
  firstName
  lastName
  company
  title
  phone
  createdAt
  updatedAt
`;

const AGENT_FIELDS = `
  id
  email
  name
  firstName
  lastName
  avatarUrl
  role
  available
`;

const KB_ARTICLE_FIELDS = `
  id
  title
  slug
  body
  bodyPlainText
  categoryId
  category {
    id
    name
    slug
  }
  published
  featured
  views
  helpfulVotes
  unhelpfulVotes
  author {
    id
    email
    name
  }
  createdAt
  updatedAt
  publishedAt
`;

const KB_CATEGORY_FIELDS = `
  id
  name
  description
  slug
  parentId
  position
  articleCount
  createdAt
  updatedAt
`;

export const queries = {
  listConversations: `
    query ListConversations(
      $first: Int
      $after: String
      $status: ConversationStatus
      $assigneeId: ID
      $contactId: ID
      $tagIds: [ID!]
    ) {
      conversations(
        first: $first
        after: $after
        status: $status
        assigneeId: $assigneeId
        contactId: $contactId
        tagIds: $tagIds
      ) {
        edges {
          node {
            ${CONVERSATION_FIELDS}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  getConversation: `
    query GetConversation($id: ID!) {
      conversation(id: $id) {
        ${CONVERSATION_FIELDS}
      }
    }
  `,

  listMessages: `
    query ListMessages($conversationId: ID!, $first: Int, $after: String) {
      messages(conversationId: $conversationId, first: $first, after: $after) {
        edges {
          node {
            ${MESSAGE_FIELDS}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  listContacts: `
    query ListContacts($first: Int, $after: String, $search: String) {
      contacts(first: $first, after: $after, search: $search) {
        edges {
          node {
            ${CONTACT_FIELDS}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  getContact: `
    query GetContact($id: ID!) {
      contact(id: $id) {
        ${CONTACT_FIELDS}
      }
    }
  `,

  listAgents: `
    query ListAgents {
      agents {
        ${AGENT_FIELDS}
      }
    }
  `,

  listKbArticles: `
    query ListKbArticles($categoryId: ID, $published: Boolean, $featured: Boolean, $first: Int, $after: String) {
      knowledgeBaseArticles(categoryId: $categoryId, published: $published, featured: $featured, first: $first, after: $after) {
        edges {
          node {
            ${KB_ARTICLE_FIELDS}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  getKbArticle: `
    query GetKbArticle($id: ID!) {
      knowledgeBaseArticle(id: $id) {
        ${KB_ARTICLE_FIELDS}
      }
    }
  `,

  listKbCategories: `
    query ListKbCategories {
      knowledgeBaseCategories {
        ${KB_CATEGORY_FIELDS}
      }
    }
  `,

  searchKbArticles: `
    query SearchKbArticles($query: String!, $first: Int, $after: String) {
      searchKnowledgeBaseArticles(query: $query, first: $first, after: $after) {
        edges {
          node {
            ${KB_ARTICLE_FIELDS}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
};

export const mutations = {
  createConversation: `
    mutation CreateConversation($input: CreateConversationInput!) {
      createConversation(input: $input) {
        conversation {
          ${CONVERSATION_FIELDS}
        }
      }
    }
  `,

  updateConversation: `
    mutation UpdateConversation($id: ID!, $input: UpdateConversationInput!) {
      updateConversation(id: $id, input: $input) {
        conversation {
          ${CONVERSATION_FIELDS}
        }
      }
    }
  `,

  sendMessage: `
    mutation SendMessage($conversationId: ID!, $input: SendMessageInput!) {
      sendMessage(conversationId: $conversationId, input: $input) {
        message {
          ${MESSAGE_FIELDS}
        }
      }
    }
  `,

  createNote: `
    mutation CreateNote($conversationId: ID!, $input: CreateNoteInput!) {
      createNote(conversationId: $conversationId, input: $input) {
        note {
          ${MESSAGE_FIELDS}
        }
      }
    }
  `,

  createContact: `
    mutation CreateContact($input: CreateContactInput!) {
      createContact(input: $input) {
        contact {
          ${CONTACT_FIELDS}
        }
      }
    }
  `,

  updateContact: `
    mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
      updateContact(id: $id, input: $input) {
        contact {
          ${CONTACT_FIELDS}
        }
      }
    }
  `,
};