'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, RotateCcw, TrendingUp, Heart, MessageSquare } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const ranges = ['7 Days', '30 Days', '90 Days'] as const;

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>('30 Days');
  const rangeNum = range.split(' ')[0];

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics', rangeNum],
    queryFn: async () => (await api.get(`/admin/stats/analytics?range=${rangeNum}`)).data.data
  });

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['admin-devices'],
    queryFn: async () => (await api.get('/admin/stats/devices')).data.data
  });

  const { data: extendedStats } = useQuery({
    queryKey: ['admin-stats-extended'],
    queryFn: async () => (await api.get('/admin/stats/extended')).data.data
  });

  const isLoading = analyticsLoading || devicesLoading;

  const tooltipStyle = {
    backgroundColor: '#111113',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 bg-white/[0.04] rounded-xl" />)}
        </div>
        <Skeleton className="h-80 bg-white/[0.04] rounded-xl" />
        <div className="grid gap-4 grid-cols-7">
          <Skeleton className="col-span-4 h-64 bg-white/[0.04] rounded-xl" />
          <Skeleton className="col-span-3 h-64 bg-white/[0.04] rounded-xl" />
        </div>
      </div>
    );
  }

  const trafficData = analyticsData?.traffic || [];
  const engagementData = analyticsData?.engagement || [];
  
  // Transform backend device stats to Recharts format
  const deviceData = devices ? Object.entries(devices).map(([name, value], idx) => ({
    name,
    value,
    color: ['#7c3aed', '#a78bfa', '#c4b5fd'][idx] || '#7c3aed'
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform traffic and engagement insights.</p>
        </div>
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                range === r ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              )}>{r}</button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: 'Total Views', value: extendedStats?.totalViews?.toLocaleString() ?? '0', icon: Eye, trend: '+24%', color: 'text-cyan-400' },
          { label: 'Total Likes', value: extendedStats?.totalLikes?.toLocaleString() ?? '0', icon: Heart, trend: '+18%', color: 'text-rose-400' },
          { label: 'Total Comments', value: extendedStats?.totalComments?.toLocaleString() ?? '0', icon: MessageSquare, trend: '+9%', color: 'text-amber-400' },
        ].map((m, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg bg-white/[0.04]", m.color)}>
                  <m.icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> {m.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traffic Trend */}
      <Card className="min-w-0 bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-sm font-semibold">Traffic Trend</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Total views vs unique visitors</CardDescription>
            </div>
            <Badge variant="outline" className="border-white/[0.08] text-muted-foreground text-[10px]">Daily</Badge>
          </div>
        </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
                <Line type="monotone" dataKey="views" stroke="#7c3aed" strokeWidth={2} dot={false} name="Views" />
                <Line type="monotone" dataKey="uniqueVisitors" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Unique" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
      </Card>

      {/* Engagement + Device */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 min-w-0 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-semibold">Engagement</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Likes and comments combined</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
                <Bar dataKey="likes" fill="#7c3aed" radius={[3, 3, 0, 0]} barSize={16} name="Likes" />
                <Bar dataKey="comments" fill="#6d28d9" radius={[3, 3, 0, 0]} barSize={16} name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 min-w-0 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-semibold">Device Breakdown</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Visitor devices</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                  {deviceData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#71717a' }} formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
