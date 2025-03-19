
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays } from 'date-fns';

const ChatLogs: React.FC = () => {
  const { chatMessages, leads, users } = useData();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [direction, setDirection] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  
  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need admin privileges to view chat logs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedMessageIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedMessageIds(newSet);
  };
  
  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.name || 'Unknown Lead';
  };
  
  const getUserName = (userId?: string) => {
    if (!userId) return 'System';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffDays = differenceInDays(today, date);
      
      if (diffDays === 0) {
        return `Today, ${format(date, 'HH:mm')}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'MMM d, yyyy HH:mm');
      }
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const filteredMessages = chatMessages
    .filter(msg => {
      const matchesSearch = 
        searchQuery === '' || 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getLeadName(msg.leadId).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDirection = 
        direction === 'all' || 
        msg.direction === direction;
      
      return matchesSearch && matchesDirection;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Logs
          </CardTitle>
          <CardDescription>
            View and monitor all WhatsApp conversations with leads.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages or leads..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  Direction: {direction === 'all' ? 'All' : direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuCheckboxItem
                  checked={direction === 'all'}
                  onCheckedChange={() => setDirection('all')}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={direction === 'incoming'}
                  onCheckedChange={() => setDirection('incoming')}
                >
                  Incoming
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={direction === 'outgoing'}
                  onCheckedChange={() => setDirection('outgoing')}
                >
                  Outgoing
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className="w-full md:w-auto"
            >
              {sortBy === 'newest' ? 'Newest first' : 'Oldest first'}
              {sortBy === 'newest' ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronUp className="ml-2 h-4 w-4" />}
            </Button>
          </div>
          
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 opacity-20 mb-3" />
              <h3 className="text-lg font-medium mb-1">No messages found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Lead</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[100px]">Direction</TableHead>
                    <TableHead className="w-[130px]">
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown 
                          className="ml-2 h-4 w-4 cursor-pointer" 
                          onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px]">Sender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map(message => (
                    <TableRow key={message.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getLeadName(message.leadId)[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{getLeadName(message.leadId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <p className={expandedMessageIds.has(message.id) ? '' : 'line-clamp-2'}>
                            {message.content}
                          </p>
                          {message.content.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => toggleExpand(message.id)}
                            >
                              {expandedMessageIds.has(message.id) ? 'Show less' : 'Show more'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={message.direction === 'incoming' ? 'secondary' : 'default'}>
                          {message.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(message.timestamp)}
                      </TableCell>
                      <TableCell>
                        {message.direction === 'incoming' 
                          ? getLeadName(message.leadId) 
                          : getUserName(message.userId)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatLogs;
