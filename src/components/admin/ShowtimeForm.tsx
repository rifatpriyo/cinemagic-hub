import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const showtimeSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  priceNormal: z.coerce.number().min(1, 'Normal price is required'),
  priceDeluxe: z.coerce.number().min(1, 'Deluxe price is required'),
  priceSuper: z.coerce.number().min(1, 'Super price is required'),
});

type ShowtimeFormData = z.infer<typeof showtimeSchema>;

interface Hall {
  id: string;
  name: string;
  type: string;
  rows: number;
  seats_per_row: number;
}

interface Movie {
  id: string;
  title: string;
}

interface ShowtimeFormProps {
  onSuccess?: () => void;
}

export const ShowtimeForm: React.FC<ShowtimeFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedHall, setSelectedHall] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ShowtimeFormData>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      priceNormal: 350,
      priceDeluxe: 500,
      priceSuper: 700,
    },
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [moviesRes, hallsRes] = await Promise.all([
        supabase.from('movies').select('id, title').order('title'),
        supabase.from('halls').select('*').eq('type', 'movie').order('name'),
      ]);

      if (moviesRes.error) throw moviesRes.error;
      if (hallsRes.error) throw hallsRes.error;

      setMovies(moviesRes.data || []);
      setHalls(hallsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSeats = async (showtimeId: string, hall: Hall) => {
    const seats = [];
    const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, hall.rows).split('');
    
    for (const row of rows) {
      for (let seatNum = 1; seatNum <= hall.seats_per_row; seatNum++) {
        // Determine seat type based on row
        let type = 'normal';
        const rowIndex = rows.indexOf(row);
        if (rowIndex < 2) {
          type = 'super';
        } else if (rowIndex < 4) {
          type = 'deluxe';
        }

        seats.push({
          showtime_id: showtimeId,
          row_letter: row,
          seat_number: seatNum,
          type,
          status: 'available',
        });
      }
    }

    const { error } = await supabase.from('seats').insert(seats);
    if (error) throw error;
  };

  const onSubmit = async (data: ShowtimeFormData) => {
    if (!selectedMovie) {
      toast.error('Please select a movie');
      return;
    }
    if (!selectedHall) {
      toast.error('Please select a hall');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create showtime
      const { data: showtime, error: showtimeError } = await supabase
        .from('showtimes')
        .insert({
          movie_id: selectedMovie,
          hall_id: selectedHall,
          date: data.date,
          time: data.time,
          price_normal: data.priceNormal,
          price_deluxe: data.priceDeluxe,
          price_super: data.priceSuper,
        })
        .select()
        .single();

      if (showtimeError) throw showtimeError;

      // Generate seats for this showtime
      const selectedHallData = halls.find(h => h.id === selectedHall);
      if (selectedHallData) {
        await generateSeats(showtime.id, selectedHallData);
      }

      toast.success('Showtime created successfully!');
      reset();
      setSelectedMovie('');
      setSelectedHall('');
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating showtime:', error);
      toast.error(error.message || 'Failed to create showtime');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Clock className="w-4 h-4" />
          Add Showtime
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Showtime</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Movie Select */}
            <div className="space-y-2">
              <Label>Movie *</Label>
              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a movie" />
                </SelectTrigger>
                <SelectContent>
                  {movies.map(movie => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hall Select */}
            <div className="space-y-2">
              <Label>Hall *</Label>
              <Select value={selectedHall} onValueChange={setSelectedHall}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hall" />
                </SelectTrigger>
                <SelectContent>
                  {halls.map(hall => (
                    <SelectItem key={hall.id} value={hall.id}>
                      {hall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            {/* Prices */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceNormal">Normal (৳)</Label>
                <Input id="priceNormal" type="number" {...register('priceNormal')} />
                {errors.priceNormal && <p className="text-sm text-destructive">{errors.priceNormal.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceDeluxe">Deluxe (৳)</Label>
                <Input id="priceDeluxe" type="number" {...register('priceDeluxe')} />
                {errors.priceDeluxe && <p className="text-sm text-destructive">{errors.priceDeluxe.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceSuper">Super (৳)</Label>
                <Input id="priceSuper" type="number" {...register('priceSuper')} />
                {errors.priceSuper && <p className="text-sm text-destructive">{errors.priceSuper.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Showtime'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
