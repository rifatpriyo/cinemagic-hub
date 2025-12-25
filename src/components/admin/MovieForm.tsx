import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  director: z.string().min(1, 'Director is required'),
  duration: z.coerce.number().min(1, 'Duration is required'),
  language: z.string().min(1, 'Language is required'),
  releaseDate: z.string().min(1, 'Release date is required'),
  genre: z.string().min(1, 'Genre is required'),
  cast: z.string().min(1, 'Cast is required'),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  onSuccess?: () => void;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
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

  const onSubmit = async (data: MovieFormData) => {
    if (!posterFile) {
      toast.error('Please upload a poster image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload poster to storage
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `movies/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(fileName, posterFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('posters')
        .getPublicUrl(fileName);

      // Insert movie into database
      const { error: insertError } = await supabase
        .from('movies')
        .insert({
          title: data.title,
          description: data.description,
          director: data.director,
          duration: data.duration,
          language: data.language,
          release_date: data.releaseDate,
          genre: data.genre.split(',').map(g => g.trim()),
          cast_members: data.cast.split(',').map(c => c.trim()),
          poster: urlData.publicUrl,
          rating: 0,
        });

      if (insertError) throw insertError;

      toast.success('Movie created successfully!');
      reset();
      setPosterFile(null);
      setPosterPreview(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating movie:', error);
      toast.error(error.message || 'Failed to create movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Movie</DialogTitle>
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

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} placeholder="Movie title" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register('description')} placeholder="Movie description" rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Director */}
            <div className="space-y-2">
              <Label htmlFor="director">Director *</Label>
              <Input id="director" {...register('director')} placeholder="Director name" />
              {errors.director && <p className="text-sm text-destructive">{errors.director.message}</p>}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input id="duration" type="number" {...register('duration')} placeholder="120" />
              {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Input id="language" {...register('language')} placeholder="English" />
              {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
            </div>

            {/* Release Date */}
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date *</Label>
              <Input id="releaseDate" type="date" {...register('releaseDate')} />
              {errors.releaseDate && <p className="text-sm text-destructive">{errors.releaseDate.message}</p>}
            </div>
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre *</Label>
            <Input id="genre" {...register('genre')} placeholder="Action, Thriller, Drama (comma separated)" />
            {errors.genre && <p className="text-sm text-destructive">{errors.genre.message}</p>}
          </div>

          {/* Cast */}
          <div className="space-y-2">
            <Label htmlFor="cast">Cast Members *</Label>
            <Input id="cast" {...register('cast')} placeholder="Actor 1, Actor 2, Actor 3 (comma separated)" />
            {errors.cast && <p className="text-sm text-destructive">{errors.cast.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Movie'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
