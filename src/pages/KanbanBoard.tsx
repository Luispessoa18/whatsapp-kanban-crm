
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Plus, 
  Trash, 
  Edit, 
  Calendar, 
  Download, 
  Upload 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Lead } from '@/types';

const KanbanBoard: React.FC = () => {
  const { funnels, leads, isLoading, moveLead, addLead, updateLead, deleteLead, exportLeads, importLeads } = useData();
  const { user, isAdmin } = useAuth();
  const [selectedFunnel, setSelectedFunnel] = useState<string>(funnels[0]?.id || '');
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    stage: '',
    funnelId: '',
    source: 'manual' as const,
  });
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  
  // Get the current funnel and its stages
  const currentFunnel = funnels.find(f => f.id === selectedFunnel);
  const stages = currentFunnel?.stages || [];
  
  // Filter leads by the selected funnel
  const filteredLeads = leads.filter(lead => lead.funnelId === selectedFunnel);
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggingLeadId(leadId);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggingLeadId(null);
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    moveLead(leadId, stageId, selectedFunnel);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Open add lead dialog
  const openAddLeadDialog = (stageId: string) => {
    setNewLead({
      ...newLead,
      stage: stageId,
      funnelId: selectedFunnel,
    });
    setIsAddLeadOpen(true);
  };
  
  // Add new lead
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
  
  // Open edit lead dialog
  const openEditLeadDialog = (lead: Lead) => {
    setCurrentLead(lead);
    setIsEditLeadOpen(true);
  };
  
  // Update lead
  const handleUpdateLead = () => {
    if (currentLead) {
      updateLead(currentLead);
      setIsEditLeadOpen(false);
      setCurrentLead(null);
    }
  };
  
  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    deleteLead(leadId);
  };
  
  // Export leads from current funnel
  const handleExport = () => {
    exportLeads(selectedFunnel);
  };
  
  // Import leads handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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
        
        const importedLeads: Omit<Lead, 'id' | 'createdAt'>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          
          importedLeads.push({
            name: nameIndex >= 0 ? values[nameIndex] : `Lead ${i}`,
            phone: phoneIndex >= 0 ? values[phoneIndex] : `+1234567890${i}`,
            email: emailIndex >= 0 ? values[emailIndex] : '',
            notes: notesIndex >= 0 ? values[notesIndex] : '',
            stage: stages[0]?.id || '',
            funnelId: selectedFunnel,
            source: 'import',
          });
        }
        
        importLeads(importedLeads, selectedFunnel);
        setIsImportOpen(false);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    };
    
    reader.readAsText(file);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={selectedFunnel}
            onValueChange={setSelectedFunnel}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
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
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsImportOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
          </div>
        </div>
      </div>
      
      {!currentFunnel ? (
        <div className="bg-secondary/50 border rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No Funnels Available</h3>
          <p className="text-muted-foreground mb-4">
            {isAdmin 
              ? "You need to create a funnel to start managing leads." 
              : "No funnels have been assigned to you yet."}
          </p>
          {isAdmin && (
            <Button asChild>
              <a href="/users">Manage Funnels</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: stages.length * 320 + 'px' }}>
            {stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => {
                const stageLeads = filteredLeads.filter(lead => lead.stage === stage.id);
                
                return (
                  <div 
                    key={stage.id} 
                    className="flex-1 min-w-[320px] max-w-sm"
                    onDrop={(e) => handleDrop(e, stage.id)}
                    onDragOver={handleDragOver}
                  >
                    <div className="bg-secondary/50 rounded-lg p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-md">
                          {stage.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({stageLeads.length})
                          </span>
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => openAddLeadDialog(stage.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] subtle-scroll pr-1">
                        {stageLeads.length === 0 ? (
                          <div className="h-20 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                            Drop leads here
                          </div>
                        ) : (
                          stageLeads.map((lead) => (
                            <Card 
                              key={lead.id}
                              className={cn(
                                "shadow-soft/50 overflow-hidden card-hover cursor-grab active:cursor-grabbing",
                                draggingLeadId === lead.id && "opacity-50"
                              )}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onDragEnd={handleDragEnd}
                            >
                              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                <div>
                                  <CardTitle className="text-base mb-1">
                                    {lead.name}
                                  </CardTitle>
                                  <CardDescription className="text-xs flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {lead.phone}
                                  </CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => openEditLeadDialog(lead)}>
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
                              </CardHeader>
                              
                              {(lead.email || lead.notes) && (
                                <CardContent className="p-4 pt-0 text-xs">
                                  {lead.email && (
                                    <div className="flex items-center text-muted-foreground mb-2">
                                      <Mail className="h-3 w-3 mr-1" />
                                      <span className="truncate">{lead.email}</span>
                                    </div>
                                  )}
                                  {lead.notes && (
                                    <p className="text-muted-foreground line-clamp-2">
                                      {lead.notes}
                                    </p>
                                  )}
                                </CardContent>
                              )}
                              
                              <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                                </span>
                                <span>{lead.source}</span>
                              </CardFooter>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to the {stages.find(s => s.id === newLead.stage)?.name} stage
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
            <Button onClick={handleAddLead} disabled={!newLead.name || !newLead.phone}>
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
              Update the lead information
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
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
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
              Upload a CSV file to import leads into {currentFunnel?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleImport}
            />
            
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

export default KanbanBoard;
