'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Initializing Secure Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Top Header Blur */}
        <div className="fixed top-0 left-64 right-0 h-16 bg-[#09090b]/50 backdrop-blur-md z-40 border-b border-white/5 flex items-center px-8">
          <div className="flex-1">
            <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Administrator Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">System Online</span>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="mt-16 relative z-10">
          {children}
        </div>

        {/* Global Background Accents */}
        <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
