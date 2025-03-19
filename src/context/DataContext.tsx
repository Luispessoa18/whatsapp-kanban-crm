import React, { createContext, useContext, useState, useEffect } from 'react';
import { Funnel, Lead, User, WhatsAppConfig } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface DataContextType {
  funnels: Funnel[];
  leads: Lead[];
  users: User[];
  isLoading: boolean;
  whatsappConfig: WhatsAppConfig | null;
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig | null>(null);
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
        
        setFunnels(storedFunnels ? JSON.parse(storedFunnels) : initialFunnels);
        setLeads(storedLeads ? JSON.parse(storedLeads) : initialLeads);
        setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
        
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
      
      if (whatsappConfig) {
        localStorage.setItem('crm_whatsapp_config', JSON.stringify(whatsappConfig));
      }
    }
  }, [funnels, leads, users, whatsappConfig, isLoading]);

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

  return (
    <DataContext.Provider
      value={{
        funnels,
        leads,
        users,
        isLoading,
        whatsappConfig,
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
