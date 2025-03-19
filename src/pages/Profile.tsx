
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Smartphone, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { connectWhatsapp, disconnectWhatsapp } = useData();
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  if (!user) return null;
  
  const handleConnectWhatsapp = async () => {
    setIsConnecting(true);
    try {
      const qrUrl = await connectWhatsapp(user.id);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnectWhatsapp = () => {
    disconnectWhatsapp(user.id);
    setQrCodeUrl(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="shadow-soft col-span-1 md:col-span-3 card-hover">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline">
                Change Photo
              </Button>
            </div>
            
            <div className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user.name} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={user.role} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value="********" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft col-span-1 md:col-span-3 card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>WhatsApp Connection</CardTitle>
              <CardDescription>
                Connect your WhatsApp account to communicate with leads
              </CardDescription>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.whatsappConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Smartphone className={`h-5 w-5 ${user.whatsappConnected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${user.whatsappConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>
                    {user.whatsappConnected 
                      ? 'WhatsApp is connected' 
                      : 'WhatsApp is not connected'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {user.whatsappConnected
                    ? 'Your WhatsApp account is connected. You can receive and send messages through the CRM.'
                    : 'Connect your WhatsApp account to start receiving and sending messages through the CRM.'}
                </p>
                
                <div className="pt-2">
                  {user.whatsappConnected ? (
                    <Button 
                      variant="outline" 
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={handleDisconnectWhatsapp}
                    >
                      Disconnect WhatsApp
                    </Button>
                  ) : (
                    <Button 
                      className="flex items-center gap-2"
                      onClick={handleConnectWhatsapp}
                      disabled={isConnecting}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>{isConnecting ? 'Connecting...' : 'Connect WhatsApp'}</span>
                    </Button>
                  )}
                </div>
              </div>
              
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg border flex flex-col items-center">
                  <p className="text-sm font-medium mb-3">Scan this QR code with WhatsApp</p>
                  <div className="glass p-2 rounded-lg shadow-sm">
                    <img 
                      src={qrCodeUrl} 
                      alt="WhatsApp QR Code" 
                      className="h-48 w-48 object-contain" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Open WhatsApp on your phone, tap Menu or Settings and select WhatsApp Web
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
