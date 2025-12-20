import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConcertSectionSelector from '@/components/booking/ConcertSectionSelector';
import BookingSummary from '@/components/booking/BookingSummary';
import TicketReceipt from '@/components/booking/TicketReceipt';
import { concerts, halls } from '@/data/mockData';
import { ConcertSection } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Music } from 'lucide-react';
import { toast } from 'sonner';

const ConcertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, addBooking } = useAuth();

  const concert = concerts.find(c => c.id === id);
  const conventionHall = halls.find(h => h.type === 'concert');

  const [selectedSection, setSelectedSection] = useState<ConcertSection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Check if user gets free show (5th show in a month)
  const isFreeShow = user && user.monthlyBookingCount >= 4;

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/auth');
      return;
    }

    if (!selectedSection || !concert) return;

    // Calculate final price
    const subtotal = selectedSection.price * quantity;
    const finalPrice = isFreeShow ? 0 : Math.max(0, subtotal - discount);

    // Generate booking ID
    const newBookingId = `TIX${Date.now().toString().slice(-8)}`;
    setBookingId(newBookingId);

    // Add booking to user's history
    addBooking({
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

    setShowReceipt(true);
    toast.success('Booking confirmed!');
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

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Concert not found</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{concert.title} - Book Tickets at TixWix</title>
        <meta name="description" content={concert.description} />
      </Helmet>

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
                    sections={concert.sections}
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
                  onPromoApply={setDiscount}
                  onProceed={handleProceed}
                />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

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
          totalPrice={isFreeShow ? 0 : selectedSection.price * quantity - discount}
          isFree={isFreeShow}
          onClose={() => {
            setShowReceipt(false);
            navigate('/profile');
          }}
        />
      )}
    </>
  );
};

export default ConcertDetail;
