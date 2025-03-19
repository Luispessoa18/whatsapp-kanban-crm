
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadChatButtonProps {
  leadId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const LeadChatButton: React.FC<LeadChatButtonProps> = ({ 
  leadId, 
  variant = 'outline',
  size = 'sm'
}) => {
  const navigate = useNavigate();
  const { getChatHistory } = useData();
  
  const chatHistory = getChatHistory(leadId);
  const unreadCount = chatHistory.filter(msg => 
    msg.direction === 'incoming' && msg.status !== 'read'
  ).length;
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => navigate(`/chat/${leadId}`)}
      className="relative"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      <span>Chat</span>
      
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          variant="destructive"
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default LeadChatButton;
