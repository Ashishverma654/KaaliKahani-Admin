'use client';

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Filter,
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldBan,
  MoreVertical,
  Plus,
  ShieldPlus,
  Lock,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Add Admin State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  // Fetch Users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    }
  });

  // Filter Logic
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) || 
                         (statusFilter === 'banned' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  // Create Admin Mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof newAdmin) => {
      return await api.post('/admin/create-admin', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('New administrator created successfully');
      setIsAddAdminOpen(false);
      setNewAdmin({ name: '', email: '', password: '' });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Failed to create admin';
      toast.error(message);
    }
  });

  // Toggle User Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.patch(`/admin/users/${id}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status toggled successfully');
    },
    onError: () => {
      toast.error('Failed to update user status');
    }
  });

  const handleToggle = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate(newAdmin);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage platform users and access controls.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white gap-2 px-6"
            onClick={() => setIsAddAdminOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Admin
          </Button>
          <div className="h-10 w-[1px] bg-white/10 mx-1" />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search name or email..." 
              className="pl-10 bg-white/[0.03] border-white/5 focus:border-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="border-white/5 bg-white/[0.03] min-w-[120px]">
                <Filter className="w-4 h-4 mr-2" />
                {statusFilter === 'all' ? 'All Users' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Users</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('banned')}>Banned Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#09090b] border-white/10 text-white">
          <DialogHeader>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30 mx-auto">
              <ShieldPlus className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Add Administrator</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground pt-1">
              Create a new administrative account with full access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-10 bg-white/[0.03] border-white/10"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kaalikahani.com"
                  className="pl-10 bg-white/[0.03] border-white/10"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/[0.03] border-white/10"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="border-white/5 hover:bg-white/5"
                onClick={() => setIsAddAdminOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                disabled={createAdminMutation.isPending}
              >
                {createAdminMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create Admin'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">User Details</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Join Date</TableHead>
              <TableHead className="text-right text-muted-foreground">Access Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell colSpan={4}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers?.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user._id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={user.isActive 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                      }
                    >
                      {user.isActive ? 'Active' : 'Banned'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <ShieldBan className="w-4 h-4 text-destructive" />
                        )}
                        <Switch 
                          checked={user.isActive} 
                          onCheckedChange={() => handleToggle(user._id)}
                          disabled={toggleStatusMutation.isPending}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
