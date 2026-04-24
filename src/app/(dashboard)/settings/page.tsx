'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Settings, 
  Globe, 
  ShieldAlert, 
  Sparkles,
  Layout
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Settings updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Site Settings</h2>
        <p className="text-muted-foreground mt-1">Configure global platform behavior and appearance.</p>
      </div>

      <form onSubmit={handleSave} className="grid gap-6">
        {/* General Settings */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Layout className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">General Configuration</span>
            </div>
            <CardTitle className="text-white">Content Curation</CardTitle>
            <CardDescription className="text-muted-foreground">Manage featured content and homepage visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featured-story">Featured Story ID</Label>
              <div className="flex gap-2">
                <Input 
                  id="featured-story" 
                  placeholder="Enter Story MongoDB ID..." 
                  className="bg-white/[0.03] border-white/10"
                />
                <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5">
                  Verify ID
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">This story will be highlighted on the main landing page carousel.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button size="lg" className="px-8 font-bold gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 animate-spin" />
                Saving Changes...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
