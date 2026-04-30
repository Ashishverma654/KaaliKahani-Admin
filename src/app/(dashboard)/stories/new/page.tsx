'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Save, 
  Send, 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  Hash, 
  Layers,
  Loader2,
  BookOpenCheck,
  Settings,
  ListOrdered,
  Library,
  Plus,
  Upload,
  Sparkles,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'Real Horror', value: 'real-horror' },
  { label: 'Paranormal', value: 'paranormal' },
  { label: 'Haunted Places', value: 'haunted-places' },
  { label: 'Urban Legends', value: 'urban-legends' },
  { label: 'General Horror', value: 'general-horror' }
];

export default function CreateStoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    coverImage: '',
    status: 'draft' as 'draft' | 'published',
    seriesId: 'none',
    seriesOrder: 1,
    newSeriesTitle: '',
    newSeriesDescription: ''
  });

  const { data: seriesList } = useQuery({
    queryKey: ['my-series'],
    queryFn: async () => {
      const res = await api.get('/series/me');
      return res.data.data;
    }
  });

  const handleSubmit = async (e: React.FormEvent, statusOverride?: 'draft' | 'published') => {
    e?.preventDefault();
    
    const finalStatus = statusOverride || formData.status;

    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: { en: formData.title },
        content: { en: formData.content },
        category: formData.category,
        coverImage: formData.coverImage,
        status: finalStatus,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        language: ['en'],
        seriesId: formData.seriesId === 'none' ? null : formData.seriesId,
        seriesOrder: formData.seriesOrder
      };

      await api.post('/admin/stories', payload);
      toast.success(finalStatus === 'published' ? 'Story published successfully!' : 'Story saved as draft!');
      router.push('/stories');
    } catch (error: any) {
      console.error('Error creating story:', error);
      const message = error.response?.data?.message || 'Failed to create story';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      const res = await api.post('/stories/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setFormData({ ...formData, coverImage: res.data.data.url });
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIRefine = async () => {
    if (!formData.content) {
      toast.error('Please write some content first');
      return;
    }
    if (!aiPrompt) {
      toast.error('Please enter a prompt for the AI');
      return;
    }

    setIsRefining(true);
    try {
      const res = await api.post('/stories/refine', {
        content: formData.content,
        prompt: aiPrompt,
        lang: 'en'
      });
      
      if (res.data.success) {
        setFormData({ ...formData, content: res.data.data.refinedContent });
        setAiPrompt('');
        setShowAIAssistant(false);
        toast.success('Story redesigned by AI!');
      }
    } catch (error: any) {
      console.error('AI Refine error:', error);
      toast.error(error.response?.data?.message || 'AI refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCreateSeries = async () => {
    if (!formData.newSeriesTitle) {
      toast.error('Please enter a series title');
      return;
    }

    setIsCreatingSeries(true);
    try {
      const res = await api.post('/series', {
        title: formData.newSeriesTitle,
        description: formData.newSeriesDescription
      });
      toast.success('Series created successfully!');
      await refetchSeries();
      setFormData({
        ...formData,
        seriesId: res.data.data._id,
        newSeriesTitle: '',
        newSeriesDescription: ''
      });
    } catch (error: any) {
      console.error('Error creating series:', error);
      toast.error(error.response?.data?.message || 'Failed to create series');
    } finally {
      setIsCreatingSeries(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create New Story</h1>
          <p className="text-muted-foreground">Draft and publish a new dark narrative</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-white/[0.05]"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            className="shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Publish Story
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Story Title
              </Label>
              <Input 
                id="title"
                placeholder="Enter a haunting title..."
                className="h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 text-lg font-semibold"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-primary" />
                Narrative Content
              </Label>
              <div className="relative group/content">
                <div className="absolute right-4 top-4 z-10 flex gap-2">
                  <Button 
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all",
                      showAIAssistant ? "border-primary/50 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "text-white/70"
                    )}
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    AI Assistant
                  </Button>
                </div>

                {showAIAssistant && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-4 top-14 z-20 w-80 p-4 rounded-xl bg-[#111113] border border-primary/20 shadow-2xl shadow-black/50 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <Wand2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">AI Redesign</span>
                    </div>
                    <Textarea 
                      placeholder="e.g., 'Make it more descriptive and add a darker twist to the ending'..."
                      className="min-h-[80px] text-xs bg-white/5 border-white/10"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 text-[10px] h-8"
                        onClick={handleAIRefine}
                        disabled={isRefining}
                      >
                        {isRefining ? (
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 mr-2" />
                        )}
                        Redesign Narrative
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[10px] h-8"
                        onClick={() => setShowAIAssistant(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                <Textarea 
                  id="content"
                  placeholder="Once upon a midnight dreary..."
                  className="min-h-[400px] bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none leading-relaxed p-6 pt-12 text-lg"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">
                Markdown formatting supported
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Metadata Area */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm space-y-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Publishing
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Published Status</Label>
                <p className="text-[11px] text-muted-foreground">Visible on homepage</p>
              </div>
              <Switch 
                checked={formData.status === 'published'}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'published' : 'draft' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Category
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#111113] border-white/10">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                Tags
              </Label>
              <Input 
                id="tags"
                placeholder="scary, mystery, ghosts..."
                className="bg-white/[0.03] border-white/10 h-10"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground">Separate with commas</p>
            </div>
          </div>

          {/* Series Settings */}
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm space-y-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Library className="w-4 h-4 text-primary" />
              Series
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="series" className="text-sm font-medium">Select Series</Label>
                <Select 
                  value={formData.seriesId} 
                  onValueChange={(value) => setFormData({ ...formData, seriesId: value })}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/10 h-10">
                    <SelectValue placeholder="Standalone Story" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111113] border-white/10">
                    <SelectItem value="none">None (Standalone)</SelectItem>
                    {seriesList?.map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>{s.title.en || s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Create New Series Inline */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Or Create New Series</p>
                <div className="space-y-3">
                  <Input 
                    placeholder="Create new series title..."
                    className="bg-white/[0.03] border-white/10 h-10 text-sm"
                    value={formData.newSeriesTitle}
                    onChange={(e) => setFormData({ ...formData, newSeriesTitle: e.target.value })}
                  />
                  <Input 
                    placeholder="Series description (optional)"
                    className="bg-white/[0.03] border-white/10 h-10 text-sm"
                    value={formData.newSeriesDescription}
                    onChange={(e) => setFormData({ ...formData, newSeriesDescription: e.target.value })}
                  />
                  <Button 
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider"
                    onClick={handleCreateSeries}
                    disabled={isCreatingSeries}
                  >
                    {isCreatingSeries ? (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3 mr-2" />
                    )}
                    Create Series
                  </Button>
                </div>
              </div>

              {formData.seriesId !== 'none' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="order" className="text-sm font-medium flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-primary" />
                    Part Number
                  </Label>
                  <Input 
                    id="order"
                    type="number"
                    min="1"
                    className="bg-white/[0.03] border-white/10 h-10"
                    value={formData.seriesOrder}
                    onChange={(e) => setFormData({ ...formData, seriesOrder: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-[10px] text-muted-foreground">Order within the series</p>
                </div>
              )}
            </div>
          </div>

          {/* Media Settings */}
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm space-y-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Cover Image
            </h3>
            
            <div className="space-y-4">
              <div className="aspect-video rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center relative overflow-hidden group">
                {formData.coverImage ? (
                  <>
                    <img 
                      src={formData.coverImage} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Don't clear immediately, just show broken image style or placeholder
                        (e.target as HTMLImageElement).style.opacity = '0.5';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, coverImage: '' })}
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      <div className="flex flex-col items-center">
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm"
                          className="h-8 bg-white/5 hover:bg-white/10 border border-white/10"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3 mr-2" />
                          )}
                          Upload Image
                        </Button>
                        <input 
                          type="file" 
                          id="image-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-xs font-medium">Or use Image URL</Label>
                <Input 
                  id="coverImage"
                  placeholder="https://images.unsplash.com/..."
                  className="bg-white/[0.03] border-white/10 h-10 text-xs"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
