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
  Skull,
  MessageSquare,
  BarChart3,
  Bell,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Stories', href: '/stories', icon: BookOpenCheck },
  { label: 'Add Story', href: '/stories/new', icon: PlusCircle },
  { label: 'Comments', href: '/comments', icon: MessageSquare },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats-sidebar'],
    queryFn: async () => (await api.get('/admin/stats')).data.data
  });

  return (
    <div className="w-[260px] h-full bg-[#09090b] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
          <Skull className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white leading-none">KaaliKahani</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] shrink-0",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
              )} />
              <span>{item.label}</span>
              {item.label === 'Stories' && stats?.totalStories !== undefined && (
                <span className="ml-auto text-[10px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded font-bold">
                  {stats.totalStories}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/40 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'admin@kk.com'}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-9 text-sm"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
