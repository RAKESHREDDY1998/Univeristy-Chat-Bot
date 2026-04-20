export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  metadata?: {
    sources?: string[];
  };
}

export interface KnowledgeItem {
  topic: string;
  content: string;
  link: string;
}
