import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MatchCard from '@/components/football/MatchCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Football: React.FC = () => {
  useEffect(() => {
    document.title = 'MLS Football Tickets - TixWix';
  }, []);

  const { data: matches, isLoading } = useQuery({
    queryKey: ['football-matches'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('football_matches')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-gradient-gold">MLS Football</span> Tickets
            </h1>
            <p className="text-muted-foreground mt-2">Book your seats for upcoming MLS matches with interactive 3D stadium view</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  id={match.id}
                  homeTeam={match.home_team}
                  awayTeam={match.away_team}
                  homeLogo={match.home_logo}
                  awayLogo={match.away_logo}
                  stadium={match.stadium}
                  date={match.date}
                  time={match.time}
                  league={match.league}
                  poster={match.poster}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-xl">No upcoming matches</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Football;
