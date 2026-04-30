'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, BookOpen, Eye, Heart, MessageSquare, Clock, 
  TrendingUp, TrendingDown, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const dateRanges = ['7 Days', '30 Days', '90 Days'] as const;

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>('30 Days');
  const rangeNum = dateRange.split(' ')[0];

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', rangeNum],
    queryFn: async () => (await api.get(`/admin/stats?range=${rangeNum}`)).data.data
  });

  const { data: extendedStats, isLoading: extendedLoading } = useQuery({
    queryKey: ['admin-stats-extended', rangeNum],
    queryFn: async () => (await api.get(`/admin/stats/extended?range=${rangeNum}`)).data.data
  });

  const { data: topContent, isLoading: topLoading } = useQuery({
    queryKey: ['admin-stats-top', rangeNum],
    queryFn: async () => (await api.get(`/admin/stats/top-content?range=${rangeNum}`)).data.data
  });

  const isLoading = statsLoading || extendedLoading || topLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 bg-white/[0.04] rounded-xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1,2].map(i => <Skeleton key={i} className="h-80 bg-white/[0.04] rounded-xl" />)}
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, trend: '+12%', up: true, color: 'text-blue-400' },
    { label: 'Total Stories', value: stats?.totalStories ?? 0, icon: BookOpen, trend: '+8%', up: true, color: 'text-purple-400' },
    { label: 'Total Views', value: extendedStats?.totalViews?.toLocaleString() ?? '0', icon: Eye, trend: '+24%', up: true, color: 'text-cyan-400' },
    { label: 'Total Likes', value: extendedStats?.totalLikes?.toLocaleString() ?? '0', icon: Heart, trend: '+18%', up: true, color: 'text-rose-400' },
    { label: 'Total Comments', value: extendedStats?.totalComments?.toLocaleString() ?? '0', icon: MessageSquare, trend: '+6%', up: true, color: 'text-amber-400' },
    { label: 'Pending Approval', value: stats?.pendingStories ?? 0, icon: Clock, trend: '-5%', up: false, color: 'text-orange-400' },
  ];

  const chartData = stats?.chartData || [];
  
  // Format top content for Recharts vertical layout (handling en/hi titles)
  const formatTopData = (data: any[], key: string) => {
    return data?.map(item => ({
      name: item.title.en || item.title.hi || 'Untitled',
      [key]: item[key]
    })) || [];
  };

  const topReadData = formatTopData(topContent?.topByViews, 'views');
  const topLikedData = formatTopData(topContent?.topByLikes, 'likesCount');
  const topCommentedData = formatTopData(topContent?.topByComments, 'commentsCount');

  return (
    <div className="space-y-6">
      {/* Page Header + Date Filter */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your ghost story platform.</p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
          {dateRanges.map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                dateRange === range 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg bg-white/[0.04]", m.color)}>
                  <m.icon className="w-4 h-4" />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  m.up ? "text-emerald-400" : "text-amber-400"
                )}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Story Reads + Top Read Stories */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 min-w-0 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-sm font-semibold">Story Reads Over Time</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Daily read count trend</CardDescription>
              </div>
              <Badge variant="outline" className="border-white/[0.08] text-muted-foreground text-[10px]">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#readGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 min-w-0 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-semibold">Top Read Stories</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">By total views</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topReadData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="views" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Most Liked + Most Commented */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-semibold">Most Liked Stories</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">By total likes</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLikedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} 
                  tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="likesCount" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-semibold">Most Commented Stories</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">By total comments</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCommentedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="commentsCount" fill="#6d28d9" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
