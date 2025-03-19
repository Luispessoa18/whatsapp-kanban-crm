
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
