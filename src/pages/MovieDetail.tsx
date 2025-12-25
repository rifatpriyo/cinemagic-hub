import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeatMap from '@/components/booking/SeatMap';
import BookingSummary from '@/components/booking/BookingSummary';
import TicketReceipt from '@/components/booking/TicketReceipt';
import { Seat } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  genre: string[];
  duration: number;
  rating: number;
  release_date: string;
  description: string;
  director: string;
  cast_members: string[];
  language: string;
  trailer_url?: string;
}

interface Showtime {
  id: string;
  movie_id: string;
  hall_id: string;
  date: string;
  time: string;
  price_normal: number;
  price_deluxe: number;
  price_super: number;
}

interface Hall {
  id: string;
  name: string;
  type: string;
  total_seats: number;
  rows: number;
  seats_per_row: number;
}

interface DbSeat {
  id: string;
  showtime_id: string;
  row_letter: string;
  seat_number: number;
  type: string;
  status: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, addBooking } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [currentSeats, setCurrentSeats] = useState<DbSeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const fetchMovieData = async () => {
    try {
      // Fetch movie
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (movieError) throw movieError;
      if (!movieData) {
        setIsLoading(false);
        return;
      }
      setMovie(movieData);
      document.title = `${movieData.title} - Book Tickets at TixWix`;

      // Fetch showtimes for this movie
      const { data: showtimesData, error: showtimesError } = await supabase
        .from('showtimes')
        .select('*')
        .eq('movie_id', id)
        .order('date', { ascending: true });

      if (showtimesError) throw showtimesError;
      setShowtimes(showtimesData || []);

      // Set default selected date
      if (showtimesData && showtimesData.length > 0) {
        setSelectedDate(showtimesData[0].date);
      }

      // Fetch halls
      const { data: hallsData, error: hallsError } = await supabase
        .from('halls')
        .select('*');

      if (hallsError) throw hallsError;
      setHalls(hallsData || []);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch seats when showtime changes
  useEffect(() => {
    if (selectedShowtime) {
      fetchSeats(selectedShowtime);
    }
  }, [selectedShowtime]);

  const fetchSeats = async (showtimeId: string) => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('showtime_id', showtimeId)
        .order('row_letter')
        .order('seat_number');

      if (error) throw error;
      setCurrentSeats(data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const currentShowtimeObj = useMemo(() => {
    return showtimes.find(st => st.id === selectedShowtime);
  }, [selectedShowtime, showtimes]);

  const currentHall = useMemo(() => {
    if (!currentShowtimeObj) return null;
    return halls.find(h => h.id === currentShowtimeObj.hall_id);
  }, [currentShowtimeObj, halls]);

  // Transform DB seats to component format
  const transformedSeats: Seat[] = useMemo(() => {
    return currentSeats.map(seat => ({
      id: seat.id,
      row: seat.row_letter,
      number: seat.seat_number,
      type: seat.type as 'normal' | 'deluxe' | 'super',
      status: seat.status as 'available' | 'selected' | 'sold',
    }));
  }, [currentSeats]);

  // Check if user gets free show (5th show in a month - after 4 bookings)
  const isFreeShow = user && user.monthlyBookingCount >= 4;
  const FREE_SEATS_LIMIT = 2;

  const dates = [...new Set(showtimes.map(st => st.date))];

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) {
        return prev.filter(s => s.id !== seat.id);
      }
      if (prev.length >= 10) {
        toast.error('Maximum 10 seats per booking');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleProceed = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/auth');
      return;
    }

    if (!currentShowtimeObj || selectedSeats.length === 0) return;

    const prices = {
      normal: currentShowtimeObj.price_normal,
      deluxe: currentShowtimeObj.price_deluxe,
      super: currentShowtimeObj.price_super,
    };

    // Calculate final price
    const subtotal = selectedSeats.reduce((total, seat) => {
      return total + prices[seat.type];
    }, 0);
    
    let finalPrice = subtotal;
    if (isFreeShow) {
      const freeSeats = selectedSeats.slice(0, FREE_SEATS_LIMIT);
      const freeAmount = freeSeats.reduce((total, seat) => {
        return total + prices[seat.type];
      }, 0);
      finalPrice = Math.max(0, subtotal - freeAmount - discount);
    } else {
      finalPrice = Math.max(0, subtotal - discount);
    }

    // Update seat statuses to 'sold'
    const seatIds = selectedSeats.map(s => s.id);
    const { error: seatUpdateError } = await supabase
      .from('seats')
      .update({ status: 'sold' })
      .in('id', seatIds);

    if (seatUpdateError) {
      console.error('Error updating seat status:', seatUpdateError);
      toast.error('Failed to reserve seats. Please try again.');
      return;
    }

    // Add booking to user's history and save to database
    const generatedBookingId = await addBooking({
      id: '', // Will be generated by database
      userId: user!.id,
      type: 'movie',
      showId: currentShowtimeObj.id,
      seats: selectedSeats,
      totalPrice: subtotal,
      discount,
      finalPrice,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
    });

    if (generatedBookingId) {
      // Set the booking ID for the receipt
      setBookingId(generatedBookingId);

      // Insert booking seats
      const bookingSeatsData = selectedSeats.map(seat => ({
        booking_id: generatedBookingId,
        seat_id: seat.id,
      }));

      await supabase.from('booking_seats').insert(bookingSeatsData);

      setShowReceipt(true);
      toast.success('Booking confirmed!');
    } else {
      // Revert seat status if booking failed
      await supabase
        .from('seats')
        .update({ status: 'available' })
        .in('id', seatIds);
      toast.error('Failed to save booking. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Movie not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Banner */}
        <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-48 md:w-64 rounded-xl shadow-2xl border-2 border-border"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 bg-primary/20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-semibold">{movie.rating}/10</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                </div>
                <span className="text-muted-foreground">{movie.release_date.split('-')[0]}</span>
                <span className="text-muted-foreground">{movie.language}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genre.map(genre => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>

              <p className="text-muted-foreground max-w-2xl">{movie.description}</p>

              <div className="text-sm text-muted-foreground">
                <p><span className="text-foreground">Director:</span> {movie.director}</p>
                <p><span className="text-foreground">Cast:</span> {movie.cast_members.join(', ')}</p>
              </div>

              {movie.trailer_url && (
                <Button variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>

          {/* Booking Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Date Selection */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map(date => {
                    const dateObj = new Date(date);
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedShowtime(null);
                          setSelectedSeats([]);
                        }}
                        className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        <span className="text-xs">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-2xl font-bold">{dateObj.getDate()}</span>
                        <span className="text-xs">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="glass-card p-6 animate-slide-up">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Select Showtime
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {showtimes
                      .filter(st => st.date === selectedDate)
                      .map(st => {
                        const hall = halls.find(h => h.id === st.hall_id);
                        const isSelected = selectedShowtime === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => {
                              setSelectedShowtime(st.id);
                              setSelectedSeats([]);
                            }}
                            className={`px-4 py-3 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                          >
                            <div className="font-bold">{st.time}</div>
                            <div className="text-xs opacity-80">{hall?.name}</div>
                            <div className="text-xs opacity-60">From ৳{st.price_normal}</div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Seat Map */}
              {currentShowtimeObj && currentHall && (
                <div className="glass-card p-6 animate-slide-up">
                  <h2 className="text-lg font-semibold mb-4">Select Your Seats</h2>
                  <SeatMap
                    seats={transformedSeats}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    rows={currentHall.rows}
                    seatsPerRow={currentHall.seats_per_row}
                  />
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <BookingSummary
                type="movie"
                selectedSeats={selectedSeats}
                prices={currentShowtimeObj ? {
                  normal: currentShowtimeObj.price_normal,
                  deluxe: currentShowtimeObj.price_deluxe,
                  super: currentShowtimeObj.price_super,
                } : undefined}
                isFreeShow={isFreeShow}
                freeSeatsLimit={FREE_SEATS_LIMIT}
                onPromoApply={setDiscount}
                onProceed={handleProceed}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Ticket Receipt Modal */}
      {showReceipt && currentShowtimeObj && currentHall && (
        <TicketReceipt
          type="movie"
          title={movie.title}
          hallName={currentHall.name}
          date={currentShowtimeObj.date}
          time={currentShowtimeObj.time}
          seats={selectedSeats}
          userName={user?.name || 'Guest'}
          bookingId={bookingId}
          totalPrice={(() => {
            const prices = {
              normal: currentShowtimeObj.price_normal,
              deluxe: currentShowtimeObj.price_deluxe,
              super: currentShowtimeObj.price_super,
            };
            const subtotal = selectedSeats.reduce((t, s) => t + prices[s.type], 0);
            if (isFreeShow) {
              const freeSeats = selectedSeats.slice(0, FREE_SEATS_LIMIT);
              const freeAmount = freeSeats.reduce((t, s) => t + prices[s.type], 0);
              return Math.max(0, subtotal - freeAmount - discount);
            }
            return Math.max(0, subtotal - discount);
          })()}
          isFree={isFreeShow && selectedSeats.length <= FREE_SEATS_LIMIT}
          freeSeatsCount={isFreeShow ? Math.min(selectedSeats.length, FREE_SEATS_LIMIT) : 0}
          onClose={() => {
            setShowReceipt(false);
            navigate('/profile');
          }}
        />
      )}
    </div>
  );
};

export default MovieDetail;