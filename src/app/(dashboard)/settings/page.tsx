'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Settings, Globe, Shield, Bell, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [wordFilter, setWordFilter] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure platform behavior and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
        {/* General */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">General</span>
            </div>
            <CardTitle className="text-white text-base">Site Configuration</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Basic platform settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Site Name</Label>
              <Input defaultValue="KaaliKahani" className="h-9 bg-white/[0.04] border-white/[0.08] text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tagline</Label>
              <Input defaultValue="Ghost stories that haunt your soul" className="h-9 bg-white/[0.04] border-white/[0.08] text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Featured Story ID</Label>
              <div className="flex gap-2">
                <Input placeholder="Enter Story MongoDB ID…" className="h-9 bg-white/[0.04] border-white/[0.08] text-sm" />
                <Button type="button" variant="outline" size="sm" className="border-white/[0.08] h-9 text-xs shrink-0">Verify</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">This story will be highlighted on the homepage.</p>
            </div>
          </CardContent>
        </Card>

        {/* Moderation */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Moderation</span>
            </div>
            <CardTitle className="text-white text-base">Content Moderation</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Control how submissions are handled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">Auto-approve stories</p>
                <p className="text-xs text-muted-foreground mt-0.5">Skip manual review for trusted authors.</p>
              </div>
              <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div>
                <p className="text-sm font-medium text-white">Profanity filter</p>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically flag stories with prohibited words.</p>
              </div>
              <Switch checked={wordFilter} onCheckedChange={setWordFilter} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Bell className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Notifications</span>
            </div>
            <CardTitle className="text-white text-base">Email Alerts</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Configure notification preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">New submission alert</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive an email when a new story is submitted.</p>
              </div>
              <Switch checked={emailNotify} onCheckedChange={setEmailNotify} />
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 gap-2 h-9 px-6" disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
