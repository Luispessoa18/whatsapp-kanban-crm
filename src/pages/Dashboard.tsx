
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, PieChart as PieChartIcon, Kanban } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6666'];

const Dashboard: React.FC = () => {
  const { funnels, leads, users } = useData();
  const { user, isAdmin } = useAuth();
  
  // Calculate stage distribution
  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    leads.forEach(lead => {
      const stage = funnels
        .flatMap(funnel => funnel.stages)
        .find(stage => stage.id === lead.stage);
      
      if (stage) {
        counts[stage.name] = (counts[stage.name] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads, funnels]);
  
  // Calculate leads by source
  const leadsBySource = React.useMemo(() => {
    const counts: Record<string, number> = {
      'manual': 0,
      'import': 0,
      'webhook': 0,
    };
    
    leads.forEach(lead => {
      counts[lead.source] = (counts[lead.source] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));
  }, [leads]);
  
  // Calculate funnel distribution
  const funnelDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    leads.forEach(lead => {
      const funnel = funnels.find(f => f.id === lead.funnelId);
      if (funnel) {
        counts[funnel.name] = (counts[funnel.name] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [leads, funnels]);
  
  const stats = React.useMemo(() => [
    {
      title: 'Total Leads',
      value: leads.length,
      description: 'Across all funnels',
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Active Funnels',
      value: funnels.length,
      description: 'Sales processes',
      icon: <Kanban className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Stages',
      value: funnels.reduce((acc, funnel) => acc + funnel.stages.length, 0),
      description: 'Workflow steps',
      icon: <PieChartIcon className="h-5 w-5 text-primary" />,
    },
    ...(isAdmin ? [
      {
        title: 'Users',
        value: users.length,
        description: 'Team members',
        icon: <Users className="h-5 w-5 text-primary" />,
      },
    ] : []),
  ], [leads.length, funnels, users, isAdmin]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-soft card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-soft card-hover">
          <CardHeader>
            <CardTitle>Leads by Stage</CardTitle>
            <CardDescription>
              Distribution of leads across funnel stages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stageCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft card-hover">
          <CardHeader>
            <CardTitle>Leads by Funnel</CardTitle>
            <CardDescription>
              Number of leads in each funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelDistribution} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft card-hover md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>
              How leads are being generated
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsBySource}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
