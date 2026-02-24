import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface MatchCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  stadium: string;
  date: string;
  time: string;
  league: string;
  poster: string;
}

const MatchCard: React.FC<MatchCardProps> = ({
  id, homeTeam, awayTeam, homeLogo, awayLogo, stadium, date, time, league, poster,
}) => {
  return (
    <Link to={`/football/${id}`} className="block group">
      <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
        <div className="relative h-40 overflow-hidden">
          <img src={poster} alt={`${homeTeam} vs ${awayTeam}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <span className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded">{league}</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img src={homeLogo} alt={homeTeam} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-semibold text-sm truncate">{homeTeam}</span>
            </div>
            <span className="text-muted-foreground font-bold text-xs shrink-0">VS</span>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="font-semibold text-sm truncate text-right">{awayTeam}</span>
              <img src={awayLogo} alt={awayTeam} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(date), 'MMM dd, yyyy')}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stadium}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MatchCard;
