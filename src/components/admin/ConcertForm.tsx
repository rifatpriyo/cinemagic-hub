import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const concertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  genre: z.string().min(1, 'Genre is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  // Section prices
  vipPrice: z.coerce.number().min(1, 'VIP price is required'),
  vipCapacity: z.coerce.number().min(1, 'VIP capacity is required'),
  frontPrice: z.coerce.number().min(1, 'Front price is required'),
  frontCapacity: z.coerce.number().min(1, 'Front capacity is required'),
  middlePrice: z.coerce.number().min(1, 'Middle price is required'),
  middleCapacity: z.coerce.number().min(1, 'Middle capacity is required'),
  backPrice: z.coerce.number().min(1, 'Back price is required'),
  backCapacity: z.coerce.number().min(1, 'Back capacity is required'),
});

type ConcertFormData = z.infer<typeof concertSchema>;

interface ConcertFormProps {
  onSuccess?: () => void;
}

export const ConcertForm: React.FC<ConcertFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ConcertFormData>({
    resolver: zodResolver(concertSchema),
    defaultValues: {
      vipPrice: 5000,
      vipCapacity: 50,
      frontPrice: 3000,
      frontCapacity: 100,
      middlePrice: 2000,
      middleCapacity: 200,
      backPrice: 1000,
      backCapacity: 300,
    },
  });

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ConcertFormData) => {
    if (!posterFile) {
      toast.error('Please upload a poster image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload poster to storage
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `concerts/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(fileName, posterFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('posters')
        .getPublicUrl(fileName);

      // Insert concert into database
      const { data: concert, error: insertError } = await supabase
        .from('concerts')
        .insert({
          title: data.title,
          artist: data.artist,
          description: data.description,
          genre: data.genre,
          date: data.date,
          time: data.time,
          poster: urlData.publicUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create sections for this concert
      const sections = [
        { concert_id: concert.id, name: 'vip', price: data.vipPrice, total_capacity: data.vipCapacity, available_capacity: data.vipCapacity },
        { concert_id: concert.id, name: 'front', price: data.frontPrice, total_capacity: data.frontCapacity, available_capacity: data.frontCapacity },
        { concert_id: concert.id, name: 'middle', price: data.middlePrice, total_capacity: data.middleCapacity, available_capacity: data.middleCapacity },
        { concert_id: concert.id, name: 'back', price: data.backPrice, total_capacity: data.backCapacity, available_capacity: data.backCapacity },
      ];

      const { error: sectionsError } = await supabase
        .from('concert_sections')
        .insert(sections);

      if (sectionsError) throw sectionsError;

      toast.success('Concert created successfully!');
      reset();
      setPosterFile(null);
      setPosterPreview(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating concert:', error);
      toast.error(error.message || 'Failed to create concert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Concert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Concert</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Poster Upload */}
          <div className="space-y-2">
            <Label>Poster Image *</Label>
            <div className="flex items-center gap-4">
              {posterPreview ? (
                <img 
                  src={posterPreview} 
                  alt="Poster preview" 
                  className="w-32 h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-48 bg-secondary rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 300x450px
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Concert Title *</Label>
              <Input id="title" {...register('title')} placeholder="Concert name" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <Label htmlFor="artist">Artist/Band *</Label>
              <Input id="artist" {...register('artist')} placeholder="Artist name" />
              {errors.artist && <p className="text-sm text-destructive">{errors.artist.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register('description')} placeholder="Concert description" rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Input id="genre" {...register('genre')} placeholder="Pop, Rock, etc." />
              {errors.genre && <p className="text-sm text-destructive">{errors.genre.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" type="time" {...register('time')} />
              {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          {/* Section Pricing */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Section Pricing & Capacity</Label>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="vipPrice" className="text-amber-500">VIP Price (৳)</Label>
                <Input id="vipPrice" type="number" {...register('vipPrice')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vipCapacity" className="text-amber-500">VIP Capacity</Label>
                <Input id="vipCapacity" type="number" {...register('vipCapacity')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="frontPrice" className="text-cyan-500">Front Price (৳)</Label>
                <Input id="frontPrice" type="number" {...register('frontPrice')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frontCapacity" className="text-cyan-500">Front Capacity</Label>
                <Input id="frontCapacity" type="number" {...register('frontCapacity')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="middlePrice" className="text-purple-500">Middle Price (৳)</Label>
                <Input id="middlePrice" type="number" {...register('middlePrice')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleCapacity" className="text-purple-500">Middle Capacity</Label>
                <Input id="middleCapacity" type="number" {...register('middleCapacity')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="backPrice" className="text-slate-400">Back Price (৳)</Label>
                <Input id="backPrice" type="number" {...register('backPrice')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backCapacity" className="text-slate-400">Back Capacity</Label>
                <Input id="backCapacity" type="number" {...register('backCapacity')} />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Concert'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
