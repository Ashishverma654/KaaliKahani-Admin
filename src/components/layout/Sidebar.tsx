'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  Users, 
  Settings, 
  LogOut, 
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Story Moderation', href: '/stories', icon: BookOpenCheck },
  { label: 'User Management', href: '/users', icon: Users },
  { label: 'Site Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="w-64 h-screen bg-[#09090b] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">KK Admin</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/40 to-primary/10 rounded-full flex items-center justify-center border border-white/10">
            <span className="text-sm font-bold text-white uppercase">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@kaalikahani.com'}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
