import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConcertSectionSelector from '@/components/booking/ConcertSectionSelector';
import BookingSummary from '@/components/booking/BookingSummary';
import TicketReceipt from '@/components/booking/TicketReceipt';
import { ConcertSection } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Concert {
  id: string;
  title: string;
  artist: string;
  poster: string;
  backdrop?: string;
  genre: string;
  date: string;
  time: string;
  description: string;
}

interface Hall {
  id: string;
  name: string;
  type: string;
}

interface DbConcertSection {
  id: string;
  concert_id: string;
  name: string;
  price: number;
  total_capacity: number;
  available_capacity: number;
}

const ConcertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, addBooking } = useAuth();

  const [concert, setConcert] = useState<Concert | null>(null);
  const [sections, setSections] = useState<ConcertSection[]>([]);
  const [conventionHall, setConventionHall] = useState<Hall | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSection, setSelectedSection] = useState<ConcertSection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (id) {
      fetchConcertData();
    }
  }, [id]);

  const fetchConcertData = async () => {
    try {
      // Fetch concert
      const { data: concertData, error: concertError } = await supabase
        .from('concerts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (concertError) throw concertError;
      if (!concertData) {
        setIsLoading(false);
        return;
      }
      setConcert(concertData);
      document.title = `${concertData.title} - Book Tickets at TixWix`;

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('concert_sections')
        .select('*')
        .eq('concert_id', id);

      if (sectionsError) throw sectionsError;

      // Transform sections to component format
      const transformedSections: ConcertSection[] = (sectionsData || []).map((s: DbConcertSection) => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        totalCapacity: s.total_capacity,
        availableCapacity: s.available_capacity,
      }));
      setSections(transformedSections);

      // Fetch convention hall
      const { data: hallData, error: hallError } = await supabase
        .from('halls')
        .select('*')
        .eq('type', 'concert')
        .maybeSingle();

      if (!hallError && hallData) {
        setConventionHall(hallData);
      }
    } catch (error) {
      console.error('Error fetching concert data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user gets free show
  const isFreeShow = user && user.monthlyBookingCount >= 4;
  const FREE_TICKETS_LIMIT = 2;

  const handleProceed = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/auth');
      return;
    }

    if (!selectedSection || !concert) return;

    // Check available capacity
    if (selectedSection.availableCapacity < quantity) {
      toast.error('Not enough tickets available in this section');
      return;
    }

    // Calculate final price
    const subtotal = selectedSection.price * quantity;
    let finalPrice = subtotal;
    if (isFreeShow) {
      const freeTickets = Math.min(quantity, FREE_TICKETS_LIMIT);
      const freeAmount = selectedSection.price * freeTickets;
      finalPrice = Math.max(0, subtotal - freeAmount - discount);
    } else {
      finalPrice = Math.max(0, subtotal - discount);
    }

    // Generate booking ID
    const newBookingId = `TIX${Date.now().toString().slice(-8)}`;
    setBookingId(newBookingId);

    // Update section capacity
    const newAvailableCapacity = selectedSection.availableCapacity - quantity;
    const { error: updateError } = await supabase
      .from('concert_sections')
      .update({ available_capacity: newAvailableCapacity })
      .eq('id', selectedSection.id);

    if (updateError) {
      console.error('Error updating section capacity:', updateError);
      toast.error('Failed to reserve tickets. Please try again.');
      return;
    }

    // Add booking to user's history and save to database
    const success = await addBooking({
      id: newBookingId,
      userId: user!.id,
      type: 'concert',
      showId: concert.id,
      section: selectedSection,
      quantity,
      totalPrice: subtotal,
      discount,
      finalPrice,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
    });

    if (success) {
      // Update local state
      setSections(prev => prev.map(s => 
        s.id === selectedSection.id 
          ? { ...s, availableCapacity: newAvailableCapacity }
          : s
      ));
      setShowReceipt(true);
      toast.success('Booking confirmed!');
    } else {
      // Revert capacity if booking failed
      await supabase
        .from('concert_sections')
        .update({ available_capacity: selectedSection.availableCapacity })
        .eq('id', selectedSection.id);
      toast.error('Failed to save booking. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Concert not found</p>
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
            src={concert.backdrop || concert.poster}
            alt={concert.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Concert Poster */}
            <div className="flex-shrink-0">
              <img
                src={concert.poster}
                alt={concert.title}
                className="w-48 md:w-64 rounded-xl shadow-2xl border-2 border-border"
              />
            </div>

            {/* Concert Info */}
            <div className="flex-1 space-y-4">
              <Badge className="bg-accent text-accent-foreground">
                <Music className="w-3 h-3 mr-1" />
                {concert.genre}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold">{concert.title}</h1>
              <p className="text-xl text-muted-foreground">{concert.artist}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{formatDate(concert.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>{concert.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{conventionHall?.name || 'Convention Hall'}</span>
                </div>
              </div>

              <p className="text-muted-foreground max-w-2xl">{concert.description}</p>
            </div>
          </div>

          {/* Booking Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-6">Select Your Section</h2>
                <ConcertSectionSelector
                  sections={sections}
                  selectedSection={selectedSection}
                  quantity={quantity}
                  onSectionSelect={setSelectedSection}
                  onQuantityChange={setQuantity}
                />
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <BookingSummary
                type="concert"
                selectedSection={selectedSection}
                quantity={quantity}
                isFreeShow={isFreeShow}
                freeTicketsLimit={FREE_TICKETS_LIMIT}
                onPromoApply={setDiscount}
                onProceed={handleProceed}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Ticket Receipt Modal */}
      {showReceipt && selectedSection && (
        <TicketReceipt
          type="concert"
          title={concert.title}
          hallName={conventionHall?.name || 'Convention Hall'}
          date={concert.date}
          time={concert.time}
          section={selectedSection}
          quantity={quantity}
          userName={user?.name || 'Guest'}
          bookingId={bookingId}
          totalPrice={(() => {
            const subtotal = selectedSection.price * quantity;
            if (isFreeShow) {
              const freeTickets = Math.min(quantity, FREE_TICKETS_LIMIT);
              const freeAmount = selectedSection.price * freeTickets;
              return Math.max(0, subtotal - freeAmount - discount);
            }
            return Math.max(0, subtotal - discount);
          })()}
          isFree={isFreeShow && quantity <= FREE_TICKETS_LIMIT}
          freeTicketsCount={isFreeShow ? Math.min(quantity, FREE_TICKETS_LIMIT) : 0}
          onClose={() => {
            setShowReceipt(false);
            navigate('/profile');
          }}
        />
      )}
    </div>
  );
};

export default ConcertDetail;