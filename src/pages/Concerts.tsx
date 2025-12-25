import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConcertCard from '@/components/concerts/ConcertCard';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConcertSection {
  id: string;
  name: string;
  price: number;
  total_capacity: number;
  available_capacity: number;
}

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
  sections?: ConcertSection[];
}

const Concerts: React.FC = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Upcoming Concerts - TixWix Convention Hall';
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      const { data: concertsData, error: concertsError } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: true });

      if (concertsError) throw concertsError;

      // Fetch sections for each concert
      const concertsWithSections = await Promise.all(
        (concertsData || []).map(async (concert) => {
          const { data: sections } = await supabase
            .from('concert_sections')
            .select('*')
            .eq('concert_id', concert.id);
          
          return { ...concert, sections: sections || [] };
        })
      );

      setConcerts(concertsWithSections);
    } catch (error) {
      console.error('Error fetching concerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform database concert to component format
  const transformConcert = (concert: Concert) => ({
    id: concert.id,
    title: concert.title,
    artist: concert.artist,
    poster: concert.poster,
    backdrop: concert.backdrop,
    genre: concert.genre,
    date: concert.date,
    time: concert.time,
    description: concert.description,
    sections: (concert.sections || []).map(s => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      totalCapacity: s.total_capacity,
      availableCapacity: s.available_capacity,
    })),
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Concerts</h1>
            <p className="text-muted-foreground">Live music experiences at our Convention Hall</p>
          </div>

          {/* Concerts Grid */}
          {concerts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {concerts.map((concert, index) => (
                <div
                  key={concert.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ConcertCard concert={transformConcert(concert)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No concerts scheduled at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for upcoming events!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Concerts;