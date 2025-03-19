
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Input 
} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Phone, 
  Mail, 
  PaperclipIcon, 
  ArrowLeft, 
  MessageCircle, 
  Clock, 
  CheckCheck 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { leads, getChatHistory, sendChatMessage } = useData();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ReturnType<typeof getChatHistory>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const lead = leads.find(l => l.id === leadId);
  
  useEffect(() => {
    if (!lead) {
      navigate('/leads');
      return;
    }
    
    setChatHistory(getChatHistory(leadId as string));
    
    // Poll for new messages every 3 seconds
    const intervalId = setInterval(() => {
      setChatHistory(getChatHistory(leadId as string));
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [leadId, lead, getChatHistory, navigate]);
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    await sendChatMessage(leadId as string, message);
    setMessage('');
    
    // Update chat history
    setChatHistory(getChatHistory(leadId as string));
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <Clock className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };
  
  if (!lead) return null;
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-2 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarFallback>{lead.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium text-base">{lead.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{lead.phone}</span>
            {lead.email && (
              <>
                <span>•</span>
                <Mail className="h-3 w-3" />
                <span>{lead.email}</span>
              </>
            )}
          </div>
        </div>
        
        <Badge variant={lead.source === 'manual' ? 'default' : 'secondary'}>
          {lead.source}
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          chatHistory.map(msg => (
            <div 
              key={msg.id} 
              className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.direction === 'outgoing' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm mb-1">{msg.content}</div>
                <div className="flex items-center justify-end gap-1 text-xs opacity-70">
                  <span>{formatMessageTime(msg.timestamp)}</span>
                  {msg.direction === 'outgoing' && getStatusIcon(msg.status)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[80px] resize-none flex-1"
          />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
