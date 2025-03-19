import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  LogOut, 
  ChevronRight,
  Kanban,
  UserCircle,
  MessageCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  if (!user) {
    return <>{children}</>;
  }
  
  const menuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      label: 'Kanban',
      icon: <Kanban className="h-5 w-5" />,
      href: '/kanban',
      active: location.pathname === '/kanban',
    },
    {
      label: 'Leads',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/leads',
      active: location.pathname === '/leads',
    },
    {
      label: 'Profile',
      icon: <UserCircle className="h-5 w-5" />,
      href: '/profile',
      active: location.pathname === '/profile',
    },
    ...(isAdmin ? [
      {
        label: 'Users',
        icon: <Users className="h-5 w-5" />,
        href: '/users',
        active: location.pathname === '/users',
      },
      {
        label: 'Chat Logs',
        icon: <MessageCircle className="h-5 w-5" />,
        href: '/chat-logs',
        active: location.pathname === '/chat-logs',
      },
    ] : []),
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar shadow-medium z-10 flex flex-col">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">WhatsApp CRM</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg transition-all group",
                    item.active
                      ? "bg-primary text-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  <ChevronRight 
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform",
                      item.active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2 border-sidebar-border"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card h-16 flex items-center px-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            {menuItems.find(item => item.active)?.label || 'Dashboard'}
          </h1>
        </div>
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
