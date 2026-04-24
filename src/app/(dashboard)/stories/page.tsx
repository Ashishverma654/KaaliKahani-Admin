'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  BrainCircuit,
  Calendar,
  Languages,
  User as UserIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

interface Story {
  _id: string;
  title: string;
  author: {
    name: string;
  };
  category: string;
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  content: string;
  aiRealismScore?: number;
  aiSuggestedCategory?: string;
}

export default function StoriesPage() {
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch Stories
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ['admin-stories'],
    queryFn: async () => {
      const response = await api.get('/admin/stories');
      return response.data;
    }
  });

  // Filter Logic
  const filteredStories = stories?.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         story.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return await api.patch(`/admin/stories/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      toast.success('Story status updated successfully');
      setIsViewModalOpen(false);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Failed to update story status';
      toast.error(message);
    }
  });

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    statusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Story Moderation</h2>
          <p className="text-muted-foreground mt-1">Review and manage community submissions.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search title or author..." 
              className="pl-10 bg-white/[0.03] border-white/5 focus:border-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="border-white/5 bg-white/[0.03] min-w-[120px]">
                <Filter className="w-4 h-4 mr-2" />
                {statusFilter === 'all' ? 'All Stories' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Stories</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Title & Author</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Language</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">AI Insights</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell colSpan={7}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : filteredStories?.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No stories found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredStories?.map((story) => (
                <TableRow key={story._id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{story.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <UserIcon className="w-3 h-3" />
                        {story.author.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-white/5 text-white font-medium border-white/10">
                      {story.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-white">
                      <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                      {story.language}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "capitalize",
                        story.status === 'pending' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        story.status === 'approved' && "bg-green-500/10 text-green-500 border-green-500/20",
                        story.status === 'rejected' && "bg-destructive/10 text-destructive border-destructive/20"
                      )}
                    >
                      {story.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                          <BrainCircuit className="w-3 h-3" />
                          Score: {story.aiRealismScore}%
                        </div>
                        <span className="text-[10px] text-muted-foreground">Suggest: {story.aiSuggestedCategory}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10">
                        <DropdownMenuItem 
                          className="gap-2 focus:bg-white/10 cursor-pointer"
                          onClick={() => {
                            setSelectedStory(story);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-green-500 focus:bg-green-500/10 focus:text-green-500 cursor-pointer"
                          onClick={() => handleAction(story._id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                          onClick={() => handleAction(story._id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </DropdownMenuItem>
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
        <DialogContent className="max-w-2xl bg-[#09090b] border-white/10 text-white overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px] tracking-widest">Review Mode</Badge>
              {selectedStory?.aiRealismScore && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">AI Score: {selectedStory.aiRealismScore}%</Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold">{selectedStory?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              By {selectedStory?.author.name} • {selectedStory?.category} • {selectedStory?.language}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-6 rounded-xl bg-white/[0.03] border border-white/5 max-h-[400px] overflow-y-auto leading-relaxed text-slate-300 italic">
            "{selectedStory?.content}"
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="border-white/5 hover:bg-white/5" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button 
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => selectedStory && handleAction(selectedStory._id, 'rejected')}
              disabled={statusMutation.isPending}
            >
              Reject Story
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => selectedStory && handleAction(selectedStory._id, 'approved')}
              disabled={statusMutation.isPending}
            >
              Approve & Publish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

