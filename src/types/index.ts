
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  whatsappConnected: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'manual' | 'import' | 'webhook';
  notes?: string;
  assignedTo?: string;
  stage: string;
  funnelId: string;
  createdAt: string;
  lastContact?: string;
}

export interface Stage {
  id: string;
  name: string;
  order: number;
}

export interface Funnel {
  id: string;
  name: string;
  stages: Stage[];
  allowedUsers: string[];
  webhook?: {
    active: boolean;
    url: string;
  };
}

export interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  provider: 'baileys' | 'whatsapp-web.js' | 'venom' | 'wppconnect' | 'custom';
  enabled: boolean;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  userId?: string;
  content: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: {
    type: 'image' | 'document' | 'audio' | 'video';
    url: string;
    name?: string;
  }[];
}
