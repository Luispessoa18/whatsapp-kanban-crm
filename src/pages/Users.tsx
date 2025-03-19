
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Funnel, Stage } from '@/types';
import {
  Users as UsersIcon,
  UserPlus,
  Kanban,
  Plus,
  MoreHorizontal,
  Trash,
  Edit,
  CheckSquare,
  Move,
  Link,
  Download,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
  const { users, funnels, addFunnel, updateFunnel, deleteFunnel } = useData();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [isNewFunnelOpen, setIsNewFunnelOpen] = useState(false);
  const [isEditFunnelOpen, setIsEditFunnelOpen] = useState(false);
  const [isEditStagesOpen, setIsEditStagesOpen] = useState(false);
  const [isEditUsersOpen, setIsEditUsersOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [editedStages, setEditedStages] = useState<Stage[]>([]);
  const [newStageName, setNewStageName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookActive, setWebhookActive] = useState(false);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateFunnel = () => {
    if (newFunnelName.trim() === '') {
      toast.error('Funnel name cannot be empty');
      return;
    }

    addFunnel({
      name: newFunnelName,
      stages: [
        { id: Date.now() + '-1', name: 'New Lead', order: 0 },
        { id: Date.now() + '-2', name: 'Contact Made', order: 1 },
        { id: Date.now() + '-3', name: 'Proposal Sent', order: 2 },
        { id: Date.now() + '-4', name: 'Closed Won', order: 3 },
        { id: Date.now() + '-5', name: 'Closed Lost', order: 4 },
      ],
      allowedUsers: users.map(user => user.id),
    });

    setNewFunnelName('');
    setIsNewFunnelOpen(false);
  };

  const handleUpdateFunnelName = () => {
    if (!selectedFunnel) return;

    updateFunnel({
      ...selectedFunnel,
      name: newFunnelName,
    });

    setIsEditFunnelOpen(false);
  };

  const handleUpdateStages = () => {
    if (!selectedFunnel) return;

    updateFunnel({
      ...selectedFunnel,
      stages: editedStages,
    });

    setIsEditStagesOpen(false);
  };

  const handleUpdateAllowedUsers = () => {
    if (!selectedFunnel) return;

    updateFunnel({
      ...selectedFunnel,
      allowedUsers: selectedUsers,
    });

    setIsEditUsersOpen(false);
  };

  const handleUpdateWebhook = () => {
    if (!selectedFunnel) return;

    updateFunnel({
      ...selectedFunnel,
      webhook: {
        active: webhookActive,
        url: webhookUrl,
      },
    });

    setIsWebhookOpen(false);
  };

  const handleDeleteFunnel = (funnel: Funnel) => {
    deleteFunnel(funnel.id);
  };

  const handleAddStage = () => {
    if (newStageName.trim() === '') {
      toast.error('Stage name cannot be empty');
      return;
    }

    setEditedStages([
      ...editedStages,
      {
        id: Date.now().toString(),
        name: newStageName,
        order: editedStages.length,
      },
    ]);

    setNewStageName('');
  };

  const handleDeleteStage = (stageId: string) => {
    setEditedStages(editedStages.filter(stage => stage.id !== stageId));
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === editedStages.length - 1)
    )
      return;

    const newStages = [...editedStages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the elements
    [newStages[index], newStages[newIndex]] = [newStages[newIndex], newStages[index]];
    
    // Update orders
    newStages.forEach((stage, i) => {
      stage.order = i;
    });
    
    setEditedStages(newStages);
  };

  const openEditFunnel = (funnel: Funnel) => {
    setSelectedFunnel(funnel);
    setNewFunnelName(funnel.name);
    setIsEditFunnelOpen(true);
  };

  const openEditStages = (funnel: Funnel) => {
    setSelectedFunnel(funnel);
    setEditedStages([...funnel.stages].sort((a, b) => a.order - b.order));
    setIsEditStagesOpen(true);
  };

  const openEditUsers = (funnel: Funnel) => {
    setSelectedFunnel(funnel);
    setSelectedUsers(funnel.allowedUsers || []);
    setIsEditUsersOpen(true);
  };

  const openWebhookDialog = (funnel: Funnel) => {
    setSelectedFunnel(funnel);
    setWebhookUrl(funnel.webhook?.url || '');
    setWebhookActive(funnel.webhook?.active || false);
    setIsWebhookOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              <span>Funnels</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="users" className="mt-0">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage your team members and their access
              </CardDescription>
            </div>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg shadow-soft/50 card-hover"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm px-2 py-1 bg-secondary rounded-full">
                      {user.role}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      user.whatsappConnected 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.whatsappConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}
                    </span>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="funnels" className="mt-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="shadow-soft glass card-hover">
            <CardHeader className="text-center">
              <CardTitle>Create New Funnel</CardTitle>
              <CardDescription>
                Set up a new sales pipeline for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <Button
                onClick={() => setIsNewFunnelOpen(true)}
                className="mt-4"
              >
                Create Funnel
              </Button>
            </CardContent>
          </Card>

          {funnels.map(funnel => (
            <Card key={funnel.id} className="shadow-soft card-hover overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>{funnel.name}</CardTitle>
                  <CardDescription>
                    {funnel.stages.length} stages • {funnel.allowedUsers.length} users
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Funnel Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEditFunnel(funnel)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename Funnel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditStages(funnel)}>
                      <Kanban className="h-4 w-4 mr-2" />
                      Edit Stages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditUsers(funnel)}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Assign Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openWebhookDialog(funnel)}>
                      <Link className="h-4 w-4 mr-2" />
                      Webhook Integration
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export Leads
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteFunnel(funnel)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Funnel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Stages:</p>
                  <div className="flex flex-wrap gap-2">
                    {funnel.stages
                      .sort((a, b) => a.order - b.order)
                      .map(stage => (
                        <div
                          key={stage.id}
                          className="text-xs px-2 py-1 bg-secondary rounded-full"
                        >
                          {stage.name}
                        </div>
                      ))}
                  </div>
                  
                  <p className="text-sm font-medium mt-3">Assigned Users:</p>
                  <div className="flex -space-x-2 overflow-hidden">
                    {funnel.allowedUsers.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return user ? (
                        <Avatar key={userId} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : null;
                    })}
                  </div>
                  
                  <div className={`mt-3 text-xs px-2 py-1 rounded-full inline-flex items-center ${
                    funnel.webhook?.active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Link className="h-3 w-3 mr-1" />
                    {funnel.webhook?.active ? 'Webhook Active' : 'No Webhook'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Create New Funnel Dialog */}
      <Dialog open={isNewFunnelOpen} onOpenChange={setIsNewFunnelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Funnel</DialogTitle>
            <DialogDescription>
              Create a new sales funnel for your team to manage leads
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="funnel-name">Funnel Name</Label>
              <Input
                id="funnel-name"
                placeholder="e.g. Sales Pipeline"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Default Stages</Label>
              <div className="space-y-2">
                <div className="p-2 bg-secondary/50 rounded-md text-sm">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      New Lead
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      Contact Made
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      Proposal Sent
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      Closed Won
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      Closed Lost
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can customize these stages after creating the funnel
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFunnelOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFunnel}>Create Funnel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Funnel Name Dialog */}
      <Dialog open={isEditFunnelOpen} onOpenChange={setIsEditFunnelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Funnel</DialogTitle>
            <DialogDescription>
              Change the name of your funnel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-funnel-name">Funnel Name</Label>
              <Input
                id="edit-funnel-name"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFunnelOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFunnelName}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stages Dialog */}
      <Dialog open={isEditStagesOpen} onOpenChange={setIsEditStagesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Funnel Stages</DialogTitle>
            <DialogDescription>
              Customize the stages in your sales funnel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto subtle-scroll">
            <div className="space-y-2">
              <Label>Current Stages</Label>
              <div className="space-y-2">
                {editedStages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span>{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMoveStage(index, 'up')}
                        disabled={index === 0}
                      >
                        <Move className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMoveStage(index, 'down')}
                        disabled={index === editedStages.length - 1}
                      >
                        <Move className="h-4 w-4 -rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleDeleteStage(stage.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {editedStages.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No stages yet. Add your first stage below.
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="new-stage">Add New Stage</Label>
              <div className="flex gap-2">
                <Input
                  id="new-stage"
                  placeholder="e.g. Follow-up Call"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddStage}>Add</Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStagesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStages}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={isEditUsersOpen} onOpenChange={setIsEditUsersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Users to Funnel</DialogTitle>
            <DialogDescription>
              Select which users can access this funnel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUsersOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAllowedUsers}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={isWebhookOpen} onOpenChange={setIsWebhookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Webhook Integration</DialogTitle>
            <DialogDescription>
              Configure webhooks to automatically add leads to this funnel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="webhook-active"
                checked={webhookActive}
                onChange={(e) => setWebhookActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="webhook-active">Enable webhook integration</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-service.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={!webhookActive}
              />
              <p className="text-xs text-muted-foreground">
                Send POST requests to this URL to add new leads automatically
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-format">Webhook Format</Label>
              <Textarea
                id="webhook-format"
                readOnly
                className="font-mono text-xs h-32"
                value={`{
  "name": "Lead Name",
  "phone": "+1234567890",
  "email": "lead@example.com",
  "notes": "Additional information"
}`}
              />
              <p className="text-xs text-muted-foreground">
                Format your webhook payload like this example
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWebhookOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWebhook}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
