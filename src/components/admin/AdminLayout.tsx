import { useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Home,
  LineChart,
  Package,
  PanelLeft,
  Newspaper,
  Tags,
  Video,
  Radio,
  BarChart3,
  LogOut,
  Users,
  Info,
  Heart,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AdminSection = 'dashboard' | 'articles' | 'categories' | 'videos' | 'live' | 'analytics' | 'states' | 'admanager' | 'about' | 'support';

interface AdminLayoutProps {
  children: ReactNode;
  user: User | null;
  userProfile: any;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onSignOut: () => void;
}

const NavLink = ({ id, label, icon: Icon, activeSection, onSectionChange, isCollapsed }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onSectionChange(id)}
          className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-all
            ${activeSection === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Icon className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">{label}</span>}
        </button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

export const AdminLayout = ({
  children,
  user,
  userProfile,
  activeSection,
  onSectionChange,
  onSignOut
}: AdminLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: Home },
    { id: 'articles' as AdminSection, label: 'Articles', icon: Newspaper },
    { id: 'categories' as AdminSection, label: 'Categories', icon: Tags },
    { id: 'states' as AdminSection, label: 'States', icon: Package },
    { id: 'videos' as AdminSection, label: 'Videos', icon: Video },
    { id: 'live' as AdminSection, label: 'Live Streams', icon: Radio },
    { id: 'admanager' as AdminSection, label: 'Ad Manager', icon: BarChart3 },
    { id: 'about' as AdminSection, label: 'About Us', icon: Info },
    { id: 'support' as AdminSection, label: 'Support Details', icon: Heart },
  ];
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2 p-2">
        {menuItems.map(item => (
          <NavLink key={item.id} {...item} activeSection={activeSection} onSectionChange={onSectionChange} isCollapsed={isCollapsed} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center border-b px-6">
           {!isCollapsed && <h1 className="text-lg font-semibold">Voice of Bharat</h1>}
        </div>
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
               <div className="h-16 flex items-center border-b px-6">
                 <h1 className="text-lg font-semibold">Voice of Bharat</h1>
               </div>
               <div className="p-2">
                {menuItems.map(item => (
                   <NavLink key={item.id} {...item} activeSection={activeSection} onSectionChange={onSectionChange} isCollapsed={false} />
                ))}
               </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="icon" className="hidden md:inline-flex" onClick={() => setIsCollapsed(!isCollapsed)}>
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle
            Sidebar</span>
          </Button>

          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Can add search here later if needed */}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Users className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userProfile?.full_name || user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
