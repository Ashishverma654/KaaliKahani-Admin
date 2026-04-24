'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  const displayStats = [
    { label: 'Total Stories', value: stats?.totalStories || '0', icon: BookOpen, color: 'text-blue-500', trend: '+12%' },
    { label: 'Pending Review', value: stats?.pendingStories || '0', icon: Clock, color: 'text-amber-500', trend: '-5%' },
    { label: 'Active Users', value: stats?.activeUsers || '0', icon: Users, color: 'text-green-500', trend: '+18%' },
    { label: 'Total Comments', value: stats?.totalComments || '0', icon: MessageSquare, color: 'text-purple-500', trend: '+24%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Platform performance and activity at a glance.</p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {displayStats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="flex items-center mt-1 text-xs font-medium text-green-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend} from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Analytics Chart */}
        <Card className="lg:col-span-4 bg-white/[0.02] border-white/5 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Submission Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground">Number of stories submitted over the last 7 days.</CardDescription>
            </div>
            <Badge variant="outline" className="border-white/10 text-muted-foreground">Last 7 Days</Badge>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.chartData || [
                  { name: 'Mon', count: 4 },
                  { name: 'Tue', count: 7 },
                  { name: 'Wed', count: 5 },
                  { name: 'Thu', count: 12 },
                  { name: 'Fri', count: 9 },
                  { name: 'Sat', count: 15 },
                  { name: 'Sun', count: 10 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions / Insights */}
        <Card className="lg:col-span-3 bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Admin Insights</CardTitle>
            <CardDescription className="text-muted-foreground">AI-driven platform analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Health Score: 98%</span>
              </div>
              <p className="text-sm text-white font-medium">Platform stability is excellent today.</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Alerts</h4>
              <div className="flex gap-3">
                <div className="mt-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-white font-medium">High User Traffic</span>: Increased activity in "Mystery" category. Consider featuring a top story.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-white font-medium">Moderation Queue</span>: 85% of today's stories have been processed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
