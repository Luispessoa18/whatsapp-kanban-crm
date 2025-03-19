import React, { createContext, useContext, useState, useEffect } from 'react';
import { Funnel, Lead, User, WhatsAppConfig, ChatMessage } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface DataContextType {
  funnels: Funnel[];
  leads: Lead[];
  users: User[];
  isLoading: boolean;
  whatsappConfig: WhatsAppConfig | null;
  chatMessages: ChatMessage[];
  addFunnel: (funnel: Omit<Funnel, 'id'>) => void;
  updateFunnel: (funnel: Funnel) => void;
  deleteFunnel: (id: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  moveLead: (leadId: string, stageId: string, funnelId: string) => void;
  connectWhatsapp: (userId: string) => Promise<string>;
  disconnectWhatsapp: (userId: string) => void;
  importLeads: (leads: Omit<Lead, 'id' | 'createdAt'>[], funnelId: string) => void;
  exportLeads: (funnelId?: string) => void;
  updateWhatsappConfig: (config: WhatsAppConfig) => void;
  sendChatMessage: (leadId: string, content: string, attachments?: any[]) => Promise<void>;
  getChatHistory: (leadId: string) => ChatMessage[];
}

const initialFunnels: Funnel[] = [
  {
    id: '1',
    name: 'Sales Funnel',
    stages: [
      { id: '1-1', name: 'New Lead', order: 0 },
      { id: '1-2', name: 'Contact Made', order: 1 },
      { id: '1-3', name: 'Proposal Sent', order: 2 },
      { id: '1-4', name: 'Negotiation', order: 3 },
      { id: '1-5', name: 'Closed Won', order: 4 },
      { id: '1-6', name: 'Closed Lost', order: 5 },
    ],
    allowedUsers: ['1', '2'],
  },
];

const initialLeads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+11234567890',
    email: 'john@example.com',
    source: 'manual',
    notes: 'Interested in premium plan',
    stage: '1-1',
    funnelId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+10987654321',
    email: 'jane@example.com',
    source: 'import',
    stage: '1-2',
    funnelId: '1',
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString(),
  },
];

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    whatsappConnected: false,
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    whatsappConnected: false,
  }
];

const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    leadId: '1',
    content: 'Hello, I\'m interested in your premium plan.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    direction: 'incoming',
    status: 'read',
  },
  {
    id: '2',
    leadId: '1',
    userId: '1',
    content: 'Thank you for your interest! Our premium plan offers several benefits.',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    direction: 'outgoing',
    status: 'delivered',
  },
  {
    id: '3',
    leadId: '2',
    content: 'Can you send me more information about pricing?',
    timestamp: new Date(Date.now() - 8600000).toISOString(),
    direction: 'incoming',
    status: 'read',
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const storedFunnels = localStorage.getItem('crm_funnels');
        const storedLeads = localStorage.getItem('crm_leads');
        const storedUsers = localStorage.getItem('crm_users');
        const storedWhatsappConfig = localStorage.getItem('crm_whatsapp_config');
        const storedChatMessages = localStorage.getItem('crm_chat_messages');
        
        setFunnels(storedFunnels ? JSON.parse(storedFunnels) : initialFunnels);
        setLeads(storedLeads ? JSON.parse(storedLeads) : initialLeads);
        setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
        setChatMessages(storedChatMessages ? JSON.parse(storedChatMessages) : initialChatMessages);
        
        if (storedWhatsappConfig) {
          setWhatsappConfig(JSON.parse(storedWhatsappConfig));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('crm_funnels', JSON.stringify(funnels));
      localStorage.setItem('crm_leads', JSON.stringify(leads));
      localStorage.setItem('crm_users', JSON.stringify(users));
      localStorage.setItem('crm_chat_messages', JSON.stringify(chatMessages));
      
      if (whatsappConfig) {
        localStorage.setItem('crm_whatsapp_config', JSON.stringify(whatsappConfig));
      }
    }
  }, [funnels, leads, users, whatsappConfig, chatMessages, isLoading]);

  const addFunnel = (funnel: Omit<Funnel, 'id'>) => {
    const newFunnel = {
      ...funnel,
      id: Date.now().toString(),
    };
    setFunnels(prev => [...prev, newFunnel]);
    toast.success('Funnel created successfully');
  };

  const updateFunnel = (funnel: Funnel) => {
    setFunnels(prev => prev.map(f => f.id === funnel.id ? funnel : f));
    toast.success('Funnel updated successfully');
  };

  const deleteFunnel = (id: string) => {
    const funnelHasLeads = leads.some(lead => lead.funnelId === id);
    
    if (funnelHasLeads) {
      toast.error('Cannot delete funnel with leads');
      return;
    }
    
    setFunnels(prev => prev.filter(f => f.id !== id));
    toast.success('Funnel deleted successfully');
  };

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setLeads(prev => [...prev, newLead]);
    toast.success('Lead added successfully');
  };

  const updateLead = (lead: Lead) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
    toast.success('Lead updated successfully');
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.success('Lead deleted successfully');
  };

  const moveLead = (leadId: string, stageId: string, funnelId: string) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId ? { ...lead, stage: stageId, funnelId } : lead
      )
    );
  };

  const connectWhatsapp = async (userId: string): Promise<string> => {
    if (whatsappConfig?.enabled && whatsappConfig?.apiUrl) {
      try {
        const response = await fetch(`${whatsappConfig.apiUrl}/qr`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${whatsappConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.qrCode) {
          setTimeout(() => {
            setUsers(prev => 
              prev.map(u => 
                u.id === userId ? { ...u, whatsappConnected: true } : u
              )
            );
            toast.success('WhatsApp connected successfully');
          }, 5000);
          
          return data.qrCode;
        }
        
        throw new Error('No QR code received from API');
      } catch (error) {
        console.error('Failed to connect to WhatsApp API:', error);
        toast.error('Failed to generate WhatsApp QR code');
        
        const mockQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=fallback-whatsapp-${userId}-${Date.now()}&bgcolor=255-255-255&color=25-D366`;
        return mockQrUrl;
      }
    } else {
      toast.warning('No WhatsApp API configured. Using mock QR code.');
      
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mockWhatsAppConnection-${userId}-${Date.now()}&bgcolor=255-255-255&color=25-D366`;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUsers(prev => 
        prev.map(u => 
          u.id === userId ? { ...u, whatsappConnected: true } : u
        )
      );
      
      toast.success('WhatsApp connected successfully (simulated)');
      return qrCodeUrl;
    }
  };

  const disconnectWhatsapp = (userId: string) => {
    if (whatsappConfig?.enabled && whatsappConfig?.apiUrl) {
      fetch(`${whatsappConfig.apiUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      }).catch(error => {
        console.error('Error disconnecting from WhatsApp API:', error);
      });
    }
    
    setUsers(prev => 
      prev.map(u => 
        u.id === userId ? { ...u, whatsappConnected: false } : u
      )
    );
    toast.success('WhatsApp disconnected');
  };

  const importLeads = (newLeads: Omit<Lead, 'id' | 'createdAt'>[], funnelId: string) => {
    const leadsToPush = newLeads.map(lead => ({
      ...lead,
      id: Date.now() + Math.random().toString(),
      createdAt: new Date().toISOString(),
      funnelId
    }));
    
    setLeads(prev => [...prev, ...leadsToPush]);
    toast.success(`${leadsToPush.length} leads imported successfully`);
  };

  const exportLeads = (funnelId?: string) => {
    const leadsToExport = funnelId 
      ? leads.filter(lead => lead.funnelId === funnelId)
      : leads;
    
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      "ID,Name,Phone,Email,Stage,Source,Created At\n" +
      leadsToExport.map(lead => 
        `${lead.id},${lead.name},${lead.phone},${lead.email || ''},${lead.stage},${lead.source},${lead.createdAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads-export-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${leadsToExport.length} leads exported successfully`);
  };

  const updateWhatsappConfig = (config: WhatsAppConfig) => {
    setWhatsappConfig(config);
    toast.success('WhatsApp configuration updated');
  };

  const sendChatMessage = async (leadId: string, content: string, attachments: any[] = []): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to send messages');
      return;
    }
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      leadId,
      userId: user.id,
      content,
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      status: 'sent',
      attachments: attachments.length > 0 ? attachments.map(a => ({
        type: a.type,
        url: a.url,
        name: a.name
      })) : undefined
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    if (whatsappConfig?.enabled) {
      console.log('Sending message to WhatsApp API:', {
        config: whatsappConfig,
        leadId,
        message: content
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTimeout(() => {
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1500);
    }
    
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId ? { ...lead, lastContact: newMessage.timestamp } : lead
      )
    );
    
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responses = [
          "Thank you for the information!",
          "I'll get back to you soon.",
          "That sounds great!",
          "Can you provide more details?",
          "I'm interested in learning more."
        ];
        
        const autoReply: ChatMessage = {
          id: Date.now().toString(),
          leadId,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          direction: 'incoming',
          status: 'delivered'
        };
        
        setChatMessages(prev => [...prev, autoReply]);
        
        setLeads(prev => 
          prev.map(lead => 
            lead.id === leadId ? { ...lead, lastContact: autoReply.timestamp } : lead
          )
        );
        
        toast.success(`New message from ${leads.find(l => l.id === leadId)?.name}`);
      }, 5000 + Math.random() * 10000);
    }
  };

  const getChatHistory = (leadId: string): ChatMessage[] => {
    return chatMessages.filter(msg => msg.leadId === leadId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return (
    <DataContext.Provider
      value={{
        funnels,
        leads,
        users,
        isLoading,
        whatsappConfig,
        chatMessages,
        addFunnel,
        updateFunnel,
        deleteFunnel,
        addLead,
        updateLead,
        deleteLead,
        moveLead,
        connectWhatsapp,
        disconnectWhatsapp,
        importLeads,
        exportLeads,
        updateWhatsappConfig,
        sendChatMessage,
        getChatHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
