'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Flag, Trash2, AlertTriangle, Clock, ChevronDown, ChevronRight } from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const res = await api.get('/admin/comments');
      return res.data.data;
    }
  });

  const flagMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/comments/${id}/flag`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment flag updated');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.patch(`/admin/comments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment deleted successfully');
    }
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedIds(next);
  };

  const filtered = (comments as any[]).filter(c => {
    const matchesSearch = c.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.storyId?.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.storyId?.title?.hi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'flagged') matchesFilter = c.isFlagged;
    if (filter === 'pending') matchesFilter = c.status === 'pending';
    if (filter === 'approved') matchesFilter = c.status === 'approved';
    
    return matchesSearch && matchesFilter;
  });

  const totalComments = comments.length;
  const flaggedCount = comments.filter((c: any) => c.isFlagged).length;
  const pendingCount = comments.filter((c: any) => c.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 bg-white/[0.04] rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 bg-white/[0.04] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Comments</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate user comments and replies.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search comments…" className="pl-10 h-9 bg-white/[0.04] border-white/[0.06] text-sm rounded-lg"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
            {(['all', 'pending', 'approved', 'flagged'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                  filter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                )}>
                  {f}
                  {f === 'flagged' && flaggedCount > 0 ? ` (${flaggedCount})` : ''}
                  {f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: 'Total Comments', value: totalComments, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Pending Approval', value: pendingCount, icon: Clock, color: 'text-cyan-400' },
          { label: 'Flagged', value: flaggedCount, icon: AlertTriangle, color: 'text-amber-400' },
        ].map((m, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-2.5 rounded-lg bg-white/[0.04]", m.color)}>
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comment List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No comments found.</div>
        ) : (
          filtered.map(comment => (
            <div key={comment._id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {/* Main Comment */}
              <div className={cn("p-4", comment.isFlagged && "border-l-2 border-l-amber-500")}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold border border-primary/20 shrink-0 mt-0.5">
                    {comment.userId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{comment.userId?.name || 'Deleted User'}</span>
                      <span className="text-[10px] text-muted-foreground">on</span>
                      <span className="text-[11px] text-primary font-medium">{comment.storyId?.title?.en || comment.storyId?.title?.hi || 'Untitled'}</span>
                      {comment.isFlagged && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]">Flagged</Badge>}
                      {comment.status === 'pending' && <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px]">Pending</Badge>}
                      {comment.status === 'rejected' && <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px]">Rejected</Badge>}
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1 ml-auto">
                        {comment.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" size="sm" 
                              className="h-7 px-2 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 gap-1"
                              onClick={() => statusMutation.mutate({ id: comment._id, status: 'approved' })}
                              disabled={statusMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="ghost" size="sm" 
                              className="h-7 px-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-1"
                              onClick={() => statusMutation.mutate({ id: comment._id, status: 'rejected' })}
                              disabled={statusMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn("h-7 px-2 text-[11px] gap-1", comment.isFlagged ? "text-amber-400" : "text-muted-foreground hover:text-amber-400")}
                          onClick={() => flagMutation.mutate(comment._id)}
                          disabled={flagMutation.isPending}
                        >
                          <Flag className="w-3 h-3" /> {comment.isFlagged ? 'Unflag' : 'Flag'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-red-400 gap-1"
                          onClick={() => {
                            if(confirm('Are you sure you want to delete this comment?')) deleteMutation.mutate(comment._id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
