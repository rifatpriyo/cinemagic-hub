import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeatMap from '@/components/booking/SeatMap';
import BookingSummary from '@/components/booking/BookingSummary';
import TicketReceipt from '@/components/booking/TicketReceipt';
import { movies, showtimes, halls } from '@/data/mockData';
import { Seat } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Play } from 'lucide-react';
import { toast } from 'sonner';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, addBooking } = useAuth();

  const movie = movies.find(m => m.id === id);
  const movieShowtimes = showtimes.filter(st => st.movieId === id);

  const [selectedDate, setSelectedDate] = useState<string>(movieShowtimes[0]?.date || '');
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (movie) {
      document.title = `${movie.title} - Book Tickets at TixWix`;
    }
  }, [movie]);

  const currentShowtime = useMemo(() => {
    return showtimes.find(st => st.id === selectedShowtime);
  }, [selectedShowtime]);

  const currentHall = useMemo(() => {
    if (!currentShowtime) return null;
    return halls.find(h => h.id === currentShowtime.hallId);
  }, [currentShowtime]);

  // Check if user gets free show (5th show in a month - after 4 bookings)
  // Only first 2 seats are free
  const isFreeShow = user && user.monthlyBookingCount >= 4;
  const FREE_SEATS_LIMIT = 2;

  const dates = [...new Set(movieShowtimes.map(st => st.date))];

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

    if (!currentShowtime || selectedSeats.length === 0) return;

    // Calculate final price - only first 2 seats are free if isFreeShow
    const subtotal = selectedSeats.reduce((total, seat) => {
      return total + currentShowtime.price[seat.type];
    }, 0);
    
    let finalPrice = subtotal;
    if (isFreeShow) {
      // Calculate free amount (only first 2 seats are free)
      const freeSeats = selectedSeats.slice(0, FREE_SEATS_LIMIT);
      const freeAmount = freeSeats.reduce((total, seat) => {
        return total + currentShowtime.price[seat.type];
      }, 0);
      finalPrice = Math.max(0, subtotal - freeAmount - discount);
    } else {
      finalPrice = Math.max(0, subtotal - discount);
    }

    // Generate booking ID
    const newBookingId = `TIX${Date.now().toString().slice(-8)}`;
    setBookingId(newBookingId);

    // Add booking to user's history and save to database
    const success = await addBooking({
      id: newBookingId,
      userId: user!.id,
      type: 'movie',
      showId: currentShowtime.id,
      seats: selectedSeats,
      totalPrice: subtotal,
      discount,
      finalPrice,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
    });

    if (success) {
      setShowReceipt(true);
      toast.success('Booking confirmed!');
    } else {
      toast.error('Failed to save booking. Please try again.');
    }
  };

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
                <span className="text-muted-foreground">{movie.releaseDate.split('-')[0]}</span>
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
                <p><span className="text-foreground">Cast:</span> {movie.cast.join(', ')}</p>
              </div>

              {movie.trailerUrl && (
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
                    {movieShowtimes
                      .filter(st => st.date === selectedDate)
                      .map(st => {
                        const hall = halls.find(h => h.id === st.hallId);
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
                            <div className="text-xs opacity-60">From ৳{st.price.normal}</div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Seat Map */}
              {currentShowtime && currentHall && (
                <div className="glass-card p-6 animate-slide-up">
                  <h2 className="text-lg font-semibold mb-4">Select Your Seats</h2>
                  <SeatMap
                    seats={currentShowtime.availableSeats}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    rows={currentHall.rows}
                    seatsPerRow={currentHall.seatsPerRow}
                  />
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <BookingSummary
                type="movie"
                selectedSeats={selectedSeats}
                prices={currentShowtime?.price}
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
        {showReceipt && currentShowtime && currentHall && (
        <TicketReceipt
          type="movie"
          title={movie.title}
          hallName={currentHall.name}
          date={currentShowtime.date}
          time={currentShowtime.time}
          seats={selectedSeats}
          userName={user?.name || 'Guest'}
          bookingId={bookingId}
          totalPrice={(() => {
            const subtotal = selectedSeats.reduce((t, s) => t + currentShowtime.price[s.type], 0);
            if (isFreeShow) {
              const freeSeats = selectedSeats.slice(0, FREE_SEATS_LIMIT);
              const freeAmount = freeSeats.reduce((t, s) => t + currentShowtime.price[s.type], 0);
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
