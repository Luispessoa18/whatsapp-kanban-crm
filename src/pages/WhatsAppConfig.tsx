
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Save,
  Server,
  SmartphoneNfc,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WhatsAppConfig as WhatsAppConfigType } from '@/types';

const WhatsAppConfig: React.FC = () => {
  const { isAdmin } = useAuth();
  const { whatsappConfig, updateWhatsappConfig } = useData();
  
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<WhatsAppConfigType['provider']>('baileys');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  // Load saved configuration
  useEffect(() => {
    if (whatsappConfig) {
      setApiUrl(whatsappConfig.apiUrl || '');
      setApiKey(whatsappConfig.apiKey || '');
      setApiProvider(whatsappConfig.provider || 'baileys');
      setIsEnabled(whatsappConfig.enabled || false);
    }
  }, [whatsappConfig]);
  
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

  const handleSaveConfig = () => {
    setIsLoading(true);
    
    // Validate fields
    if (!apiUrl) {
      toast.error('API URL is required');
      setIsLoading(false);
      return;
    }
    
    try {
      // Save to context
      updateWhatsappConfig({
        apiUrl,
        apiKey,
        provider: apiProvider,
        enabled: isEnabled,
        lastUpdated: new Date().toISOString()
      });
      
      toast.success('WhatsApp API configuration saved successfully');
    } catch (error) {
      console.error('Failed to save WhatsApp config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!apiUrl) {
      toast.error('API URL is required');
      return;
    }
    
    setTestStatus('loading');
    setTestMessage('Testing connection to WhatsApp API...');
    
    try {
      // Simulate API call to test connection
      const response = await fetch(apiUrl + '/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTestStatus('success');
        setTestMessage('Connection successful! API is responding correctly.');
        toast.success('WhatsApp API connection test successful');
      } else {
        setTestStatus('error');
        setTestMessage(`API returned error: ${data.message || 'Unknown error'}`);
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('API test failed:', error);
      setTestStatus('error');
      setTestMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Connection test failed');
    }
  };

  const handleProviderChange = (value: string) => {
    // This ensures we only set valid provider values
    if (value === 'baileys' || 
        value === 'whatsapp-web.js' || 
        value === 'venom' || 
        value === 'wppconnect' || 
        value === 'custom') {
      setApiProvider(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          WhatsApp API Configuration
        </h2>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              <span>WhatsApp API Settings</span>
            </CardTitle>
            <CardDescription>
              Configure the connection to your unofficial WhatsApp REST API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This feature requires a third-party WhatsApp API service that supports REST endpoints.
                Make sure your API provider complies with WhatsApp's terms of service.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-provider">API Provider</Label>
                <Select value={apiProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger id="api-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baileys">Baileys</SelectItem>
                    <SelectItem value="whatsapp-web.js">whatsapp-web.js</SelectItem>
                    <SelectItem value="venom">Venom Bot</SelectItem>
                    <SelectItem value="wppconnect">WPPConnect</SelectItem>
                    <SelectItem value="custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select your WhatsApp API provider or choose "Custom API" for other implementations
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-url">API Base URL</Label>
                <Input
                  id="api-url"
                  placeholder="https://your-whatsapp-api.example.com/api"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The base URL of your WhatsApp API server
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key / Token</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Your API key or access token"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Authentication key or token for your API (if required)
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="api-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
                <Label htmlFor="api-enabled">Enable WhatsApp integration</Label>
              </div>
            </div>
            
            {testStatus !== 'idle' && (
              <div className={`p-4 rounded-md ${
                testStatus === 'loading' ? 'bg-blue-50 text-blue-800' :
                testStatus === 'success' ? 'bg-green-50 text-green-800' :
                'bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {testStatus === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {testStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {testStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                  <p>{testMessage}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <Label>API Endpoints Expected</Label>
              <Textarea 
                readOnly 
                className="font-mono text-xs h-32"
                value={`POST /auth/login - Initialize session
GET /status - Check connection status
POST /send/text - Send text message
POST /send/media - Send media message
GET /qr - Get QR code for scanning
GET /contacts - List contacts
...and others depending on provider`}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                <span>These endpoints may vary based on your selected API provider</span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!apiUrl || isLoading}
              className="gap-2"
            >
              <SmartphoneNfc className="h-4 w-4" />
              Test Connection
            </Button>
            <Button 
              onClick={handleSaveConfig} 
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span>WhatsApp Connection Status</span>
            </CardTitle>
            <CardDescription>
              Current status of your WhatsApp integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Connection Status:</span>
                <Badge variant={isEnabled ? "success" : "destructive"}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Provider:</span>
                <span>{apiProvider}</span>
              </div>
              
              {whatsappConfig?.lastUpdated && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Updated:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(whatsappConfig.lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppConfig;
