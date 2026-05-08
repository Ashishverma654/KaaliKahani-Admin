'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, CheckCircle, XCircle, Search, Filter, Calendar, Languages, User as UserIcon, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

interface Story {
  _id: string;
  title: any;
  author: { name: string };
  category: string;
  language: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  createdAt: string;
  content: any;
  aiRealismScore?: number;
  aiSuggestedCategory?: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ['admin-stories'],
    queryFn: async () => (await api.get('/admin/stories')).data.data
  });

  const getStr = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'object') return Object.values(val).join(' ');
    return String(val);
  };

  const getTitle = (title: any): string => {
    if (!title) return 'Untitled';
    if (typeof title === 'object') return title.en || title.hi || Object.values(title)[0] as string;
    return String(title);
  };

  const filteredStories = stories?.filter(story => {
    const title = getStr(story.title);
    const author = getStr(story.author?.name);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      await api.patch(`/admin/stories/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      toast.success('Story status updated');
      setIsViewModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update')
  });

  const handleAction = (id: string, status: 'approved' | 'rejected') =>
    statusMutation.mutate({ id, status });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (!filteredStories) return;
    if (selectedIds.size === filteredStories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStories.map(s => s._id)));
    }
  };

  const handleBulkAction = (status: 'approved' | 'rejected') => {
    selectedIds.forEach(id => statusMutation.mutate({ id, status }));
    setSelectedIds(new Set());
  };

  const pendingCount = stories?.filter(s => s.status === 'pending').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Stories</h1>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/20 text-xs">{pendingCount} pending</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Review and manage community submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
            onClick={() => router.push('/stories/new')}
          >
            <PlusCircle className="w-4 h-4" />
            Create Story
          </Button>
          <div className="w-px h-6 bg-white/[0.06] mx-1" />
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search title or author…"
              className="pl-10 h-9 bg-white/[0.04] border-white/[0.06] text-sm rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-white/[0.06] bg-white/[0.04] h-9 text-sm gap-1.5 hidden md:flex">
                <Filter className="w-3.5 h-3.5" />
                {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111113] border-white/[0.08]">
              {['all', 'pending', 'approved', 'rejected', 'draft'].map(s => (
                <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="capitalize cursor-pointer">{s === 'all' ? 'All Stories' : s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs / Partitions */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
        {['all', 'pending', 'approved'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setSelectedIds(new Set()); // Clear selection when switching tabs
            }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              statusFilter === s 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            {s}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-1">
          <span className="text-sm text-primary font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto">
            {/* Show Approve only if there are pending stories selected */}
            {(stories?.some(s => selectedIds.has(s._id) && s.status === 'pending')) && (
              <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                onClick={() => handleBulkAction('approved')}>
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </Button>
            )}
            {/* Show Reject only if there are non-rejected stories selected */}
            {(stories?.some(s => selectedIds.has(s._id) && s.status !== 'rejected')) && (
              <Button size="sm" className="h-8 bg-destructive hover:bg-destructive/90 text-white text-xs gap-1.5"
                onClick={() => handleBulkAction('rejected')}>
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground"
              onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <input type="checkbox" className="accent-primary w-3.5 h-3.5 rounded cursor-pointer"
                  checked={filteredStories?.length ? selectedIds.size === filteredStories.length : false}
                  onChange={toggleSelectAll} />
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Title & Author</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Category</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Language</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Date</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs font-semibold pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3,4,5].map(i => (
                <TableRow key={i} className="border-white/[0.06]">
                  <TableCell colSpan={7} className="py-3 px-4"><Skeleton className="h-10 w-full bg-white/[0.04] rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredStories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                  No stories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStories?.map(story => (
                <TableRow key={story._id} className="border-white/[0.06] hover:bg-white/[0.02] transition-colors group">
                  <TableCell className="pl-4">
                    <input type="checkbox" className="accent-primary w-3.5 h-3.5 rounded cursor-pointer"
                      checked={selectedIds.has(story._id)} onChange={() => toggleSelect(story._id)} />
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{getTitle(story.title)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> {story.author?.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-white/[0.04] text-white/80 border-white/[0.06] text-[11px]">{story.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-white/70 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-muted-foreground" /> {story.language}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-[10px] font-semibold capitalize border",
                      story.status === 'pending' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      story.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      story.status === 'rejected' && "bg-red-500/10 text-red-400 border-red-500/20",
                      story.status === 'draft' && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>{story.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/[0.06]">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111113] border-white/[0.08] w-44">
                        <DropdownMenuItem className="gap-2 cursor-pointer text-sm" onClick={() => { setSelectedStory(story); setIsViewModalOpen(true); }}>
                          <Eye className="w-4 h-4 text-primary" /> Preview
                        </DropdownMenuItem>
                        {story.status !== 'approved' && (
                          <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-emerald-400 focus:text-emerald-400"
                            onClick={() => handleAction(story._id, 'approved')}>
                            <CheckCircle className="w-4 h-4" /> Approve
                          </DropdownMenuItem>
                        )}
                        {story.status !== 'rejected' && (
                          <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-red-400 focus:text-red-400"
                            onClick={() => handleAction(story._id, 'rejected')}>
                            <XCircle className="w-4 h-4" /> Reject
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-[#111113] border-white/[0.08] text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase tracking-wider">Review</Badge>
              {selectedStory?.status && (
                <Badge className={cn("text-[10px] capitalize border",
                  selectedStory.status === 'pending' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  selectedStory.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  selectedStory.status === 'rejected' && "bg-red-500/10 text-red-400 border-red-500/20",
                  selectedStory.status === 'draft' && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}>{selectedStory.status}</Badge>
              )}
            </div>
            <DialogTitle className="text-xl font-bold">{getTitle(selectedStory?.title)}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              By {selectedStory?.author?.name} · {selectedStory?.category} · {selectedStory?.language}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] max-h-[360px] overflow-y-auto text-sm text-white/80 leading-relaxed italic">
            "{getStr(selectedStory?.content)}"
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" className="border-white/[0.06]" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            {selectedStory?.status !== 'rejected' && (
              <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white"
                onClick={() => selectedStory && handleAction(selectedStory._id, 'rejected')}
                disabled={statusMutation.isPending}>Reject</Button>
            )}
            {selectedStory?.status !== 'approved' && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => selectedStory && handleAction(selectedStory._id, 'approved')}
                disabled={statusMutation.isPending}>Approve & Publish</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
