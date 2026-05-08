'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Search, Bell, ChevronDown, Settings, LogOut, Menu, X } from 'lucide-react';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats-header'],
    queryFn: async () => (await api.get('/admin/stats')).data.data
  });

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 min-w-0 relative">
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 lg:px-8 gap-4">
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden h-9 w-9 text-muted-foreground hover:bg-white/[0.06]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search stories, users…" 
              className="pl-10 h-9 bg-white/[0.04] border-white/[0.06] text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Search Toggle for Mobile (Icon only) */}
            <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9 text-muted-foreground">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-white/[0.06]">
                  <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                  {stats?.pendingStories > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-[#09090b]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-[#111113] border-white/[0.08] shadow-xl p-0">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <span className="text-[10px] text-primary hover:underline cursor-pointer">Mark all as read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {stats?.pendingStories > 0 ? (
                    <div 
                      className="p-4 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => router.push('/stories')}
                    >
                      <p className="text-xs text-white font-medium mb-1">Pending Stories</p>
                      <p className="text-[11px] text-muted-foreground">
                        There are {stats.pendingStories} stories waiting for your approval.
                      </p>
                      <p className="text-[9px] text-primary/60 mt-2">Requires attention</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-xs italic">
                      No new notifications.
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-white/[0.06] text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white h-8" onClick={() => router.push('/stories')}>
                    View All Stories
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="w-px h-6 bg-white/[0.06] mx-1" />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors outline-none">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/40 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-white leading-none">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Administrator</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#111113] border-white/[0.08] shadow-xl">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push('/settings')}>
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
