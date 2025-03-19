
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash,
  Download,
  Upload,
} from 'lucide-react';
import { format } from 'date-fns';
import { Lead } from '@/types';

const LeadsPage: React.FC = () => {
  const { funnels, leads, users, addLead, updateLead, deleteLead, exportLeads, importLeads } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [selectedFunnelForImport, setSelectedFunnelForImport] = useState('');
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    stage: '',
    funnelId: '',
    source: 'manual' as const,
  });
  
  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      lead.phone.toLowerCase().includes(searchLower) ||
      (lead.email && lead.email.toLowerCase().includes(searchLower))
    );
  });
  
  const handleOpenAddLead = () => {
    // Default to first funnel and its first stage
    const defaultFunnel = funnels[0];
    const defaultStage = defaultFunnel?.stages.sort((a, b) => a.order - b.order)[0];
    
    setNewLead({
      ...newLead,
      funnelId: defaultFunnel?.id || '',
      stage: defaultStage?.id || '',
    });
    
    setIsAddLeadOpen(true);
  };
  
  const handleAddLead = () => {
    addLead(newLead);
    setIsAddLeadOpen(false);
    setNewLead({
      name: '',
      phone: '',
      email: '',
      notes: '',
      stage: '',
      funnelId: '',
      source: 'manual',
    });
  };
  
  const handleOpenEditLead = (lead: Lead) => {
    setCurrentLead(lead);
    setIsEditLeadOpen(true);
  };
  
  const handleUpdateLead = () => {
    if (currentLead) {
      updateLead(currentLead);
      setIsEditLeadOpen(false);
      setCurrentLead(null);
    }
  };
  
  const handleDeleteLead = (id: string) => {
    deleteLead(id);
  };
  
  const handleExportAll = () => {
    exportLeads();
  };
  
  // Import leads handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFunnelForImport) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
        const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone'));
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
        const notesIndex = headers.findIndex(h => h.toLowerCase().includes('notes'));
        
        // Find the first stage in the selected funnel
        const funnel = funnels.find(f => f.id === selectedFunnelForImport);
        const firstStage = funnel?.stages.sort((a, b) => a.order - b.order)[0];
        
        const importedLeads: Omit<Lead, 'id' | 'createdAt'>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          
          importedLeads.push({
            name: nameIndex >= 0 ? values[nameIndex] : `Lead ${i}`,
            phone: phoneIndex >= 0 ? values[phoneIndex] : `+1234567890${i}`,
            email: emailIndex >= 0 ? values[emailIndex] : '',
            notes: notesIndex >= 0 ? values[notesIndex] : '',
            stage: firstStage?.id || '',
            funnelId: selectedFunnelForImport,
            source: 'import',
          });
        }
        
        importLeads(importedLeads, selectedFunnelForImport);
        setIsImportOpen(false);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    };
    
    reader.readAsText(file);
  };
  
  // Get funnel and stage names for a lead
  const getFunnelAndStageName = (lead: Lead) => {
    const funnel = funnels.find(f => f.id === lead.funnelId);
    const stage = funnel?.stages.find(s => s.id === lead.stage);
    
    return {
      funnelName: funnel?.name || 'Unknown',
      stageName: stage?.name || 'Unknown',
    };
  };
  
  // Get user name for assignment
  const getUserName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">All Leads</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExportAll}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsImportOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            
            <Button 
              className="flex items-center gap-2"
              onClick={handleOpenAddLead}
            >
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="shadow-soft">
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Funnel</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p>No leads found</p>
                        {searchTerm && (
                          <p className="text-sm">Try a different search term</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const { funnelName, stageName } = getFunnelAndStageName(lead);
                    return (
                      <TableRow key={lead.id} className="group hover:bg-secondary/30">
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{lead.phone}</div>
                            {lead.email && (
                              <div className="text-xs text-muted-foreground">{lead.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{funnelName}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs">
                            {stageName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="capitalize">{lead.source}</div>
                        </TableCell>
                        <TableCell>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{getUserName(lead.assignedTo)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenEditLead(lead)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteLead(lead.id)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to your CRM
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="funnel">Funnel</Label>
                <Select
                  value={newLead.funnelId}
                  onValueChange={(value) => {
                    const funnel = funnels.find(f => f.id === value);
                    const firstStage = funnel?.stages.sort((a, b) => a.order - b.order)[0];
                    setNewLead({
                      ...newLead,
                      funnelId: value,
                      stage: firstStage?.id || '',
                    });
                  }}
                >
                  <SelectTrigger id="funnel">
                    <SelectValue placeholder="Select funnel" />
                  </SelectTrigger>
                  <SelectContent>
                    {funnels.map((funnel) => (
                      <SelectItem key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={newLead.stage}
                  onValueChange={(value) => setNewLead({ ...newLead, stage: value })}
                  disabled={!newLead.funnelId}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {newLead.funnelId &&
                      funnels
                        .find(f => f.id === newLead.funnelId)
                        ?.stages.sort((a, b) => a.order - b.order)
                        .map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                placeholder="Additional information..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLead}
              disabled={!newLead.name || !newLead.phone || !newLead.funnelId || !newLead.stage}
            >
              Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Lead Dialog */}
      <Dialog open={isEditLeadOpen} onOpenChange={setIsEditLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information
            </DialogDescription>
          </DialogHeader>
          
          {currentLead && (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={currentLead.name}
                    onChange={(e) => setCurrentLead({ ...currentLead, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={currentLead.phone}
                    onChange={(e) => setCurrentLead({ ...currentLead, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={currentLead.email || ''}
                    onChange={(e) => setCurrentLead({ ...currentLead, email: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-funnel">Funnel</Label>
                    <Select
                      value={currentLead.funnelId}
                      onValueChange={(value) => {
                        const funnel = funnels.find(f => f.id === value);
                        const firstStage = funnel?.stages.sort((a, b) => a.order - b.order)[0];
                        setCurrentLead({
                          ...currentLead,
                          funnelId: value,
                          stage: firstStage?.id || '',
                        });
                      }}
                    >
                      <SelectTrigger id="edit-funnel">
                        <SelectValue placeholder="Select funnel" />
                      </SelectTrigger>
                      <SelectContent>
                        {funnels.map((funnel) => (
                          <SelectItem key={funnel.id} value={funnel.id}>
                            {funnel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-stage">Stage</Label>
                    <Select
                      value={currentLead.stage}
                      onValueChange={(value) => setCurrentLead({ ...currentLead, stage: value })}
                    >
                      <SelectTrigger id="edit-stage">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {funnels
                          .find(f => f.id === currentLead.funnelId)
                          ?.stages.sort((a, b) => a.order - b.order)
                          .map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-assigned">Assigned To</Label>
                  <Select
                    value={currentLead.assignedTo || ''}
                    onValueChange={(value) => setCurrentLead({ ...currentLead, assignedTo: value || undefined })}
                  >
                    <SelectTrigger id="edit-assigned">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={currentLead.notes || ''}
                    onChange={(e) => setCurrentLead({ ...currentLead, notes: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditLeadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLead}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Import Leads Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Leads</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import leads
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-funnel">Funnel</Label>
              <Select
                value={selectedFunnelForImport}
                onValueChange={setSelectedFunnelForImport}
              >
                <SelectTrigger id="import-funnel">
                  <SelectValue placeholder="Select funnel" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leads will be added to the first stage of the selected funnel
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={!selectedFunnelForImport}
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">CSV Format:</p>
              <p>Your CSV should include columns for name, phone, email, and notes.</p>
              <p className="mt-2">Example:</p>
              <pre className="bg-secondary p-2 rounded-md mt-1 overflow-x-auto">
                name,phone,email,notes<br/>
                John Doe,+1234567890,john@example.com,Interested in premium<br/>
                Jane Smith,+0987654321,jane@example.com,Call back next week
              </pre>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage;
