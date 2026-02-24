import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Stadium3D from '@/components/football/Stadium3D';
import BookingSummary from '@/components/booking/BookingSummary';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Loader2, Users, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FootballSection {
  id: string;
  name: string;
  price: number;
  totalCapacity: number;
  availableCapacity: number;
  color: string;
}

const FootballDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedSection, setSelectedSection] = useState<FootballSection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['football-match', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('football_matches')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['football-sections', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('football_sections')
        .select('*')
        .eq('match_id', id!);
      if (error) throw error;
      return (data as any[]).map((s: any) => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        totalCapacity: s.total_capacity,
        availableCapacity: s.available_capacity,
        color: s.color,
      }));
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (match) {
      document.title = `${match.home_team} vs ${match.away_team} - TixWix`;
    }
  }, [match]);

  const handleSectionSelect = (section: FootballSection) => {
    setSelectedSection(section);
    setQuantity(1);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book tickets');
      navigate('/auth');
      return;
    }
    if (!selectedSection || !match) return;

    const totalPrice = selectedSection.price * quantity;
    const finalPrice = Math.max(0, totalPrice - discount);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase as any).from('bookings').insert({
      user_id: user.id,
      type: 'football',
      show_id: match.id,
      section_name: selectedSection.name,
      quantity,
      total_price: totalPrice,
      discount,
      final_price: finalPrice,
      status: 'confirmed',
    });

    if (error) {
      toast.error('Booking failed. Please try again.');
      return;
    }

    // Update available capacity
    await (supabase as any)
      .from('football_sections')
      .update({ available_capacity: selectedSection.availableCapacity - quantity })
      .eq('id', selectedSection.id);

    toast.success('Tickets booked successfully! 🎉');
    navigate('/profile');
  };

  if (matchLoading || sectionsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!match || !sections) return null;

  // Map sections for BookingSummary compatibility
  const concertStyleSection = selectedSection ? {
    id: selectedSection.id,
    name: selectedSection.name,
    price: selectedSection.price,
    totalCapacity: selectedSection.totalCapacity,
    availableCapacity: selectedSection.availableCapacity,
  } : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={match.backdrop || match.poster} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg">{match.league}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{match.home_team} <span className="text-muted-foreground">vs</span> {match.away_team}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(new Date(match.date), 'EEEE, MMMM dd, yyyy')}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{match.time}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{match.stadium}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {match.description && (
            <p className="text-muted-foreground mb-6 max-w-2xl">{match.description}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3D Stadium + Section List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold">Select Your Section</h2>
              <p className="text-sm text-muted-foreground">Click on a section in the 3D stadium or choose from the list below</p>

              <div className="relative">
                <Stadium3D
                  sections={sections}
                  selectedSection={selectedSection}
                  onSectionSelect={handleSectionSelect}
                />
              </div>

              {/* Section cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((section) => {
                  const isSelected = selectedSection?.id === section.id;
                  const isSoldOut = section.availableCapacity === 0;
                  return (
                    <button
                      key={section.id}
                      onClick={() => !isSoldOut && handleSectionSelect(section)}
                      disabled={isSoldOut}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all duration-300 text-left',
                        'border-border hover:border-primary/50',
                        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary',
                        isSoldOut && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{ borderLeftColor: section.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm">{section.name}</h3>
                        <span className="text-lg font-bold text-primary">${section.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{isSoldOut ? 'Sold Out' : `${section.availableCapacity} available`}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity selector */}
              {selectedSection && (
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Number of Tickets</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-lg font-bold transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-xl font-bold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(Math.min(10, selectedSection.availableCapacity), quantity + 1))}
                        className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-lg font-bold transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Max 10 tickets per booking</p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div>
              <BookingSummary
                type="concert"
                selectedSection={concertStyleSection}
                quantity={quantity}
                onPromoApply={setDiscount}
                onProceed={handleBooking}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FootballDetail;
