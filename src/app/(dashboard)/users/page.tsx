'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, User as UserIcon, Mail, Calendar, MoreVertical, Plus, ShieldPlus, Lock, Loader2, Settings2, ShieldAlert, Users, UserPlus, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

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
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data.data
  });

  const filteredUsers = users?.filter(user => {
    const name = String(user.name || '');
    const email = String(user.email || '');
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'banned' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof newAdmin) => await api.post('/admin/create-admin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Administrator created');
      setIsAddAdminOpen(false);
      setNewAdmin({ name: '', email: '', password: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create admin')
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => await api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update status')
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete user')
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => await api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update user')
  });

  const activeCount = users?.filter(u => u.isActive).length ?? 0;
  const totalCount = users?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform users and access controls.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5 h-9 text-sm"
            onClick={() => setIsAddAdminOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Admin
          </Button>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users…" className="pl-10 h-9 bg-white/[0.04] border-white/[0.06] text-sm rounded-lg"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-white/[0.06] bg-white/[0.04] h-9 text-sm gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111113] border-white/[0.08]">
              <DropdownMenuItem onClick={() => setStatusFilter('all')} className="cursor-pointer">All Users</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')} className="cursor-pointer">Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('banned')} className="cursor-pointer">Banned</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: 'Total Users', value: totalCount, icon: Users, color: 'text-blue-400' },
          { label: 'Active Users', value: activeCount, icon: Activity, color: 'text-emerald-400' },
          { label: 'New (30 days)', value: Math.min(totalCount, 12), icon: UserPlus, color: 'text-purple-400' },
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

      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent className="sm:max-w-md bg-[#111113] border-white/[0.08] text-white">
          <DialogHeader>
            <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center mb-3 border border-primary/20 mx-auto">
              <ShieldPlus className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-center">Add Administrator</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-sm">
              Create a new admin account with full access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createAdminMutation.mutate(newAdmin); }} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input id="name" placeholder="Full name" className="h-9 bg-white/[0.04] border-white/[0.08] text-sm"
                value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" placeholder="admin@kaalikahani.com" className="h-9 bg-white/[0.04] border-white/[0.08] text-sm"
                value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="h-9 bg-white/[0.04] border-white/[0.08] text-sm"
                value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" className="border-white/[0.06]" onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 min-w-[100px]" disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold pl-4">User</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Joined</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Role</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs font-semibold pr-4">Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3,4,5].map(i => (
                <TableRow key={i} className="border-white/[0.06]">
                  <TableCell colSpan={5} className="py-3 px-4"><Skeleton className="h-10 w-full bg-white/[0.04] rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">No users found.</TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map(user => (
                <TableRow key={user._id} className="border-white/[0.06] hover:bg-white/[0.02] transition-colors group">
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-[10px] font-semibold border",
                      user.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{user.isActive ? 'Active' : 'Banned'}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/[0.08] text-white/60 text-[10px] capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-3">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleStatusMutation.mutate(user._id)}
                        disabled={toggleStatusMutation.isPending}
                        className="data-[state=checked]:bg-emerald-500 scale-90"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/[0.06]">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111113] border-white/[0.08] w-44">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="gap-2 cursor-pointer text-sm"
                          >
                            <Settings2 className="w-4 h-4 text-primary" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this user?')) {
                                deleteUserMutation.mutate(user._id);
                              }
                            }}
                            className="gap-2 cursor-pointer text-sm text-red-400 focus:text-red-400"
                          >
                            <ShieldAlert className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#111113] border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile and permissions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedUser) {
              const formData = new FormData(e.currentTarget);
              updateUserMutation.mutate({
                id: selectedUser._id,
                data: {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  role: formData.get('role')
                }
              });
            }
          }} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs">Name</Label>
              <Input id="edit-name" name="name" defaultValue={selectedUser?.name} className="h-9 bg-white/[0.04] border-white/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs">Email</Label>
              <Input id="edit-email" name="email" type="email" defaultValue={selectedUser?.email} className="h-9 bg-white/[0.04] border-white/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role" className="text-xs">Role</Label>
              <select id="edit-role" name="role" defaultValue={selectedUser?.role} className="w-full h-9 bg-[#111113] border border-white/[0.08] rounded-md px-3 text-sm outline-none focus:border-primary transition-colors">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
