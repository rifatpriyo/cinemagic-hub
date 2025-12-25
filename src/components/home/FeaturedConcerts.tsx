import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConcertCard from '@/components/concerts/ConcertCard';
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

const FeaturedConcerts: React.FC = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      const { data: concertsData, error: concertsError } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: true })
        .limit(3);

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
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Upcoming Concerts</h2>
            <p className="text-muted-foreground mt-1">Live music experiences at Convention Hall</p>
          </div>
          <Link to="/concerts">
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {concerts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No concerts scheduled at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedConcerts;