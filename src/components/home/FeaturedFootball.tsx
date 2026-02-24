import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MatchCard from '@/components/football/MatchCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

const FeaturedFootball: React.FC = () => {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['featured-football'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('football_matches')
        .select('*')
        .order('date', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              ⚽ <span className="text-gradient-gold">MLS Football</span> Matches
            </h2>
            <p className="text-muted-foreground mt-1">Book tickets with interactive 3D stadium view</p>
          </div>
          <Link to="/football">
            <Button variant="ghost" className="gap-2 group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
          <p className="text-center text-muted-foreground py-8">No upcoming matches</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedFootball;
